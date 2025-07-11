'use server';

import { requireVerifiedEmail } from "@/utils/auth";
import { createServerAction } from "zsa";
import { withRateLimit, RATE_LIMITS } from "@/utils/with-rate-limit";
import { withKVCache } from "@/utils/with-kv-cache";
import { logTransaction, updateUserCredits } from "@/utils/credits";
import { CREDIT_TRANSACTION_TYPE } from "@/db/schema";
import {
  aiModelRequestSchema,
  aiModelStreamRequestSchema,
  type AIModelRequest,
  type AIModelStreamRequest
} from "@/schemas/ai-model.schema";
import { z } from "zod";

// Type for OpenAI-compatible API response
interface OpenAICompatibleResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: {
    total_tokens?: number;
  };
}

// Configuration for DeepSeek models
const MODEL_CONFIG = {
  'deepseek-chat': {
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    creditCost: 5, // Based on DeepSeek pricing: ~$0.27 per 1M input tokens
    getHeaders: () => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    }),
  },
  'deepseek-reasoner': {
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    creditCost: 10, // Higher cost for reasoning model: ~$0.55 per 1M input tokens
    getHeaders: () => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    }),
  },
} as const;

// Helper function to transform request for different API formats
function transformRequestForModel(model: string, request: AIModelRequest) {
  // DeepSeek uses OpenAI-compatible format
  switch (model) {
    case 'deepseek-chat':
    case 'deepseek-reasoner':
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
function extractResponseText(model: string, response: OpenAICompatibleResponse): string {
  // DeepSeek returns OpenAI-compatible format
  switch (model) {
    case 'deepseek-chat':
    case 'deepseek-reasoner':
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
            async () => await callDeepSeekModel(input, modelConfig, session.user.id),
            { key: cacheKey, ttl: '1 hour' }
          );
        } catch (error) {
          console.error('Cache error, falling back to direct call:', error);
          return await callDeepSeekModel(input, modelConfig, session.user.id);
        }
      }

      return await callDeepSeekModel(input, modelConfig, session.user.id);
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
      return await callDeepSeekModelStream(input, modelConfig, session.user.id);
    }, RATE_LIMITS.PURCHASE);
  });

// Helper function to call DeepSeek model
async function callDeepSeekModel(
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

    const data = await response.json() as OpenAICompatibleResponse;
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
    console.error('DeepSeek API error:', error);
    throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function for streaming responses
async function callDeepSeekModelStream(
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
    console.error('DeepSeek streaming API error:', error);
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