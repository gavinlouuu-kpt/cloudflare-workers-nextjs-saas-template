'use server';

import { requireVerifiedEmail } from "@/utils/auth";
import { createServerAction } from "zsa";
import { withRateLimit, RATE_LIMITS } from "@/utils/with-rate-limit";
import { withKVCache } from "@/utils/with-kv-cache";
import { logTransaction, updateUserCredits } from "@/utils/credits";
import { CREDIT_TRANSACTION_TYPE } from "@/db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { 
  aiModelRequestSchema, 
  aiModelStreamRequestSchema,
  type AIModelRequest,
  type AIModelStreamRequest
} from "@/schemas/ai-model.schema";
import { z } from "zod";

// Configuration for different self-hosted models
const MODEL_CONFIG = {
  'qwen2.5:0.5b': {
    apiUrl: process.env.LLAMA_API_URL || 'http://localhost:11434/v1/chat/completions',
    apiKey: process.env.LLAMA_API_KEY || '', // Ollama doesn't require API key for local
    creditCost: 1, // Very cheap for testing
    getHeaders: () => ({
      'Content-Type': 'application/json',
      ...(process.env.LLAMA_API_KEY ? { 'Authorization': `Bearer ${process.env.LLAMA_API_KEY}` } : {}),
    }),
  },
  'llama3.2:1b': {
    apiUrl: process.env.LLAMA_API_URL || 'http://localhost:11434/v1/chat/completions',
    apiKey: process.env.LLAMA_API_KEY || '',
    creditCost: 2, // Cheap for testing
    getHeaders: () => ({
      'Content-Type': 'application/json',
      ...(process.env.LLAMA_API_KEY ? { 'Authorization': `Bearer ${process.env.LLAMA_API_KEY}` } : {}),
    }),
  },
  'llama3.2:3b': {
    apiUrl: process.env.LLAMA_API_URL || 'http://localhost:11434/v1/chat/completions',
    apiKey: process.env.LLAMA_API_KEY || '',
    creditCost: 5, // Moderate cost
    getHeaders: () => ({
      'Content-Type': 'application/json',
      ...(process.env.LLAMA_API_KEY ? { 'Authorization': `Bearer ${process.env.LLAMA_API_KEY}` } : {}),
    }),
  },
  'phi3:mini': {
    apiUrl: process.env.CUSTOM_MODEL_API_URL || 'http://localhost:11434/v1/chat/completions',
    apiKey: process.env.CUSTOM_MODEL_API_KEY || '',
    creditCost: 3, // Small Microsoft model
    getHeaders: () => ({
      'Content-Type': 'application/json',
      ...(process.env.CUSTOM_MODEL_API_KEY ? { 'Authorization': `Bearer ${process.env.CUSTOM_MODEL_API_KEY}` } : {}),
    }),
  },
} as const;

// Helper function to transform request for different API formats
function transformRequestForModel(model: string, request: AIModelRequest) {
  // All Ollama models use OpenAI-compatible format
  switch (model) {
    case 'qwen2.5:0.5b':
    case 'llama3.2:1b':
    case 'llama3.2:3b':
    case 'phi3:mini':
      return {
        model: model,
        messages: [
          { role: 'user', content: request.prompt }
        ],
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        stream: false,
      };
    
    default:
      throw new Error(`Unsupported model: ${model}`);
  }
}

// Helper function to extract response text from different API formats
function extractResponseText(model: string, response: any): string {
  // All Ollama models return OpenAI-compatible format
  switch (model) {
    case 'qwen2.5:0.5b':
    case 'llama3.2:1b':
    case 'llama3.2:3b':
    case 'phi3:mini':
      return response.choices?.[0]?.message?.content || '';
    
    default:
      return String(response);
  }
}

// Main AI model action
export const generateAIResponse = createServerAction()
  .input(aiModelRequestSchema)
  .handler(async ({ input }) => {
    return withRateLimit(async () => {
      const session = await requireVerifiedEmail();
      if (!session) {
        throw new Error("Authentication required");
      }

      const modelConfig = MODEL_CONFIG[input.model];
      if (!modelConfig) {
        throw new Error(`Model ${input.model} not configured`);
      }

      // Check if user has enough credits
      if (session.user.currentCredits < modelConfig.creditCost) {
        throw new Error(`Insufficient credits. Required: ${modelConfig.creditCost}, Available: ${session.user.currentCredits}`);
      }

      // Generate cache key for caching responses
      const cacheKey = `ai-response:${input.model}:${Buffer.from(input.prompt).toString('base64').slice(0, 50)}:${input.temperature}:${input.maxTokens}`;

      // Use cache if requested
      if (input.useCache) {
        try {
          return await withKVCache(
            async () => await callSelfHostedModel(input, modelConfig, session.user.id),
            { key: cacheKey, ttl: '1 hour' }
          );
        } catch (error) {
          console.error('Cache error, falling back to direct call:', error);
          return await callSelfHostedModel(input, modelConfig, session.user.id);
        }
      }

      return await callSelfHostedModel(input, modelConfig, session.user.id);
    }, RATE_LIMITS.PURCHASE); // Using existing rate limit, you can create a custom one
  });

// Streaming AI model action
export const generateAIResponseStream = createServerAction()
  .input(aiModelStreamRequestSchema)
  .handler(async ({ input }) => {
    return withRateLimit(async () => {
      const session = await requireVerifiedEmail();
      if (!session) {
        throw new Error("Authentication required");
      }

      const modelConfig = MODEL_CONFIG[input.model];
      if (!modelConfig) {
        throw new Error(`Model ${input.model} not configured`);
      }

      // Check if user has enough credits
      if (session.user.currentCredits < modelConfig.creditCost) {
        throw new Error(`Insufficient credits. Required: ${modelConfig.creditCost}, Available: ${session.user.currentCredits}`);
      }

      // For streaming, we can't use cache easily, so we call directly
      return await callSelfHostedModelStream(input, modelConfig, session.user.id);
    }, RATE_LIMITS.PURCHASE);
  });

// Helper function to call self-hosted model
async function callSelfHostedModel(
  request: AIModelRequest,
  modelConfig: typeof MODEL_CONFIG[keyof typeof MODEL_CONFIG],
  userId: string
) {
  const transformedRequest = transformRequestForModel(request.model, request);
  
  try {
    const response = await fetch(modelConfig.apiUrl, {
      method: 'POST',
      headers: modelConfig.getHeaders(),
      body: JSON.stringify(transformedRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Model API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as any;
    const responseText = extractResponseText(request.model, data);

    // Deduct credits and log transaction
    await updateUserCredits(userId, -modelConfig.creditCost);
    await logTransaction({
      userId,
      amount: -modelConfig.creditCost,
      description: `AI model usage: ${request.model}`,
      type: CREDIT_TRANSACTION_TYPE.AI_USAGE,
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiration
    });

    return {
      text: responseText,
      model: request.model,
      creditsUsed: modelConfig.creditCost,
      tokensUsed: data.usage?.total_tokens || 0,
    };
  } catch (error) {
    console.error('Self-hosted model API error:', error);
    throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function for streaming responses
async function callSelfHostedModelStream(
  request: AIModelStreamRequest,
  modelConfig: typeof MODEL_CONFIG[keyof typeof MODEL_CONFIG],
  userId: string
) {
  const transformedRequest = {
    ...transformRequestForModel(request.model, request),
    stream: true,
  };

  try {
    const response = await fetch(modelConfig.apiUrl, {
      method: 'POST',
      headers: modelConfig.getHeaders(),
      body: JSON.stringify(transformedRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Model API error (${response.status}): ${errorText}`);
    }

    // Deduct credits immediately for streaming
    await updateUserCredits(userId, -modelConfig.creditCost);
    await logTransaction({
      userId,
      amount: -modelConfig.creditCost,
      description: `AI model usage (stream): ${request.model}`,
      type: CREDIT_TRANSACTION_TYPE.AI_USAGE,
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    // Return the stream response
    // Note: In a real implementation, you might want to transform the stream format
    return {
      stream: response.body,
      model: request.model,
      creditsUsed: modelConfig.creditCost,
    };
  } catch (error) {
    console.error('Self-hosted model streaming error:', error);
    throw new Error(`Failed to generate streaming AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Action to get available models and their costs
export const getAvailableModels = createServerAction()
  .input(z.object({}))
  .handler(async () => {
    const session = await requireVerifiedEmail();
    if (!session) {
      throw new Error("Authentication required");
    }

    return {
      models: Object.entries(MODEL_CONFIG).map(([model, config]) => ({
        name: model,
        creditCost: config.creditCost,
        available: !!config.apiKey,
      })),
      userCredits: session.user.currentCredits,
    };
  });

// Action to get AI usage statistics
export const getAIUsageStats = createServerAction()
  .input(z.object({
    days: z.number().min(1).max(90).optional().default(30),
  }))
  .handler(async ({ input }) => {
    const session = await requireVerifiedEmail();
    if (!session) {
      throw new Error("Authentication required");
    }

    // This would query your credit transactions to get usage stats
    // Implementation depends on your analytics requirements
    return {
      totalCreditsUsed: 0,
      totalRequests: 0,
      modelUsage: [],
      period: input.days,
    };
  }); 