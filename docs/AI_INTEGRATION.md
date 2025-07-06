# Self-Hosted AI Model Integration Guide

This guide explains how to integrate your self-hosted AI models with the Cloudflare Workers Next.js SaaS template.

## Overview

The template provides a complete solution for integrating self-hosted AI models with:

- 🔐 **Authentication & Authorization**: Only authenticated users can access models
- 💳 **Credit-based Billing**: Automatic deduction of credits per API call
- 🏷️ **Rate Limiting**: Protect your models from abuse
- ⚡ **Caching**: Reduce costs with intelligent response caching
- 📊 **Usage Tracking**: Complete audit trail of all AI interactions
- 🌍 **Edge Computing**: Global distribution via Cloudflare Workers
- 🔄 **Streaming Support**: Real-time streaming responses

## Architecture

### Server Actions Pattern
```typescript
// src/actions/ai-model.actions.ts
export const generateAIResponse = createServerAction()
  .input(aiModelRequestSchema)
  .handler(async ({ input }) => {
    // Rate limiting, authentication, credit checking
    // API call to your self-hosted model
    // Credit deduction and transaction logging
  });
```

### Cloudflare Workers Integration
- **Global Edge**: Your AI calls run from 200+ locations worldwide
- **KV Caching**: Intelligent response caching with configurable TTL
- **D1 Database**: Transaction logging and usage analytics
- **Rate Limiting**: Built-in protection against abuse

## Setup Instructions

### 1. Environment Variables

Add these environment variables to your Cloudflare Worker:

```bash
# OpenAI-Compatible API (e.g., vLLM, Ollama, LocalAI)
OPENAI_COMPATIBLE_API_URL=https://your-model-server.com/v1/chat/completions
OPENAI_API_KEY=your-api-key

# Anthropic-Compatible API
ANTHROPIC_API_URL=https://your-anthropic-server.com/v1/messages
ANTHROPIC_API_KEY=your-api-key

# Llama/Custom Models
LLAMA_API_URL=https://your-llama-server.com/v1/chat/completions
LLAMA_API_KEY=your-api-key

CUSTOM_MODEL_API_URL=https://your-custom-model.com/generate
CUSTOM_MODEL_API_KEY=your-api-key
```

### 2. Database Migration

The AI_USAGE transaction type has been added to track AI model usage:

```sql
-- Already included in the schema
CREDIT_TRANSACTION_TYPE.AI_USAGE = 'AI_USAGE'
```

Generate and apply the migration:
```bash
pnpm db:generate add_ai_usage_transaction_type
```

### 3. Model Configuration

Models are configured in `src/actions/ai-model.actions.ts`:

```typescript
const MODEL_CONFIG = {
  'your-model': {
    apiUrl: process.env.YOUR_MODEL_API_URL,
    apiKey: process.env.YOUR_MODEL_API_KEY,
    creditCost: 10, // Credits per request
    getHeaders: () => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.YOUR_MODEL_API_KEY}`,
    }),
  },
}
```

## API Integration Patterns

### OpenAI-Compatible APIs

Works with:
- **vLLM**: High-performance LLM serving
- **Ollama**: Local LLM hosting
- **LocalAI**: Self-hosted OpenAI alternative
- **TGI (Text Generation Inference)**: Hugging Face serving
- **LiteLLM**: Universal LLM proxy

Example request format:
```typescript
{
  model: "your-model-name",
  messages: [{ role: "user", content: "Hello!" }],
  temperature: 0.7,
  max_tokens: 1000
}
```

### Anthropic-Compatible APIs

For Claude-style APIs:
```typescript
{
  model: "claude-3-sonnet-20240229",
  messages: [{ role: "user", content: "Hello!" }],
  temperature: 0.7,
  max_tokens: 1000
}
```

### Custom API Formats

Add your own model format in `transformRequestForModel()`:
```typescript
case 'your-custom-model':
  return {
    prompt: request.prompt,
    temperature: request.temperature,
    max_tokens: request.maxTokens,
    // Your custom parameters
    custom_param: "value",
  };
```

## Frontend Integration

### Using the AI Chat Component

```tsx
import { AIModelChat } from "@/components/ai-model-chat";

export default function YourPage() {
  return <AIModelChat className="max-w-4xl mx-auto" />;
}
```

### Custom Integration with Server Actions

```tsx
"use client";
import { useServerAction } from "zsa-react";
import { generateAIResponse } from "@/actions/ai-model.actions";

export function MyCustomAI() {
  const { execute, isPending } = useServerAction(generateAIResponse, {
    onSuccess: (result) => {
      console.log("AI Response:", result.data.text);
      console.log("Credits used:", result.data.creditsUsed);
    },
  });

  const handleGenerate = () => {
    execute({
      prompt: "Hello, AI!",
      model: "gpt-4",
      temperature: 0.7,
      maxTokens: 1000,
      useCache: true,
    });
  };

  return (
    <button onClick={handleGenerate} disabled={isPending}>
      {isPending ? "Generating..." : "Generate"}
    </button>
  );
}
```

## Advanced Features

### Streaming Responses

```typescript
import { generateAIResponseStream } from "@/actions/ai-model.actions";

const { execute } = useServerAction(generateAIResponseStream, {
  onSuccess: (result) => {
    // Handle streaming response
    const stream = result.data.stream;
    // Process stream data...
  },
});
```

### Response Caching

Responses are automatically cached in Cloudflare KV:
- **Cache Key**: Based on prompt, model, and parameters
- **TTL**: 1 hour by default
- **Bypass**: Set `useCache: false` to skip caching

### Credit Management

```typescript
// Check available models and costs
const { execute: getModels } = useServerAction(getAvailableModels);

// Get usage statistics
const { execute: getStats } = useServerAction(getAIUsageStats, {
  onSuccess: (result) => {
    console.log("Total requests:", result.data.totalRequests);
    console.log("Credits used:", result.data.totalCreditsUsed);
  },
});
```

## Rate Limiting

The integration includes automatic rate limiting:
- **Per-user limits**: Configurable requests per time window
- **IP-based fallback**: For unauthenticated requests
- **Model-specific limits**: Different limits per model type

Customize in `src/actions/ai-model.actions.ts`:
```typescript
return withRateLimit(async () => {
  // Your AI logic
}, {
  identifier: 'ai-model-generation',
  limit: 10,           // 10 requests
  windowInSeconds: 60, // per minute
});
```

## Error Handling

The system includes comprehensive error handling:

### API Errors
```typescript
try {
  await generateResponse({ ... });
} catch (error) {
  // Automatic error handling:
  // - Invalid API keys
  // - Model unavailable
  // - Insufficient credits
  // - Rate limit exceeded
}
```

### Fallback Strategies
```typescript
// Automatic fallback to Cloudflare Workers AI
if (selfHostedFails && env.AI) {
  return await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
    messages: [{ role: 'user', content: input.prompt }]
  });
}
```

## Monitoring & Analytics

### Transaction Logging
All AI usage is automatically logged:
```sql
SELECT 
  description,
  amount as credits_used,
  createdAt,
  expirationDate
FROM credit_transaction 
WHERE type = 'AI_USAGE' 
  AND userId = ?
ORDER BY createdAt DESC;
```

### Usage Analytics
```typescript
// Get user's AI usage over time
const stats = await getAIUsageStats({ days: 30 });
```

### Cloudflare Analytics
- Request latency and success rates
- Geographic distribution of requests
- Error rates by model type

## Security Considerations

### API Key Management
- Store API keys as Cloudflare Worker secrets
- Never expose keys in client-side code
- Rotate keys regularly

### Input Validation
- All inputs validated with Zod schemas
- Maximum prompt length limits
- Parameter boundary checks

### Rate Limiting
- Per-user and IP-based limiting
- Protects against abuse and DoS
- Configurable thresholds

## Cost Optimization

### Caching Strategy
```typescript
// Cache expensive model responses
const cacheKey = `ai-response:${model}:${promptHash}`;
return await withKVCache(
  () => callSelfHostedModel(input),
  { key: cacheKey, ttl: '1 hour' }
);
```

### Credit Pricing
```typescript
const MODEL_CONFIG = {
  'fast-model': { creditCost: 1 },      // Cheap, fast
  'smart-model': { creditCost: 10 },    // Expensive, capable
  'huge-model': { creditCost: 50 },     // Very expensive
};
```

### Edge Optimization
- Cloudflare Workers reduce latency
- Smart Placement routes to optimal regions
- Global caching reduces redundant calls

## Example Integrations

### vLLM Server
```bash
# Start vLLM server
vllm serve meta-llama/Llama-2-7b-chat-hf \
  --host 0.0.0.0 \
  --port 8000 \
  --api-key your-secret-key

# Environment variable
LLAMA_API_URL=https://your-vllm-server.com/v1/chat/completions
LLAMA_API_KEY=your-secret-key
```

### Ollama
```bash
# Start Ollama
ollama serve
ollama pull llama2

# Environment variable
LLAMA_API_URL=http://localhost:11434/v1/chat/completions
```

### Custom Model Server
```python
# Your custom model server
@app.post("/generate")
async def generate(request: GenerateRequest):
    response = your_model.generate(
        prompt=request.prompt,
        temperature=request.temperature,
        max_tokens=request.max_tokens
    )
    return {"text": response}
```

## Troubleshooting

### Common Issues

1. **"Model not configured"**
   - Check environment variables are set
   - Verify API keys are correct

2. **"Insufficient credits"**
   - User needs to purchase more credits
   - Check credit balance in dashboard

3. **"Rate limit exceeded"**
   - User making too many requests
   - Adjust rate limits if needed

4. **API timeouts**
   - Check model server health
   - Consider increasing timeout values

### Debug Mode
```typescript
// Enable debug logging
console.log("Model config:", modelConfig);
console.log("Request:", transformedRequest);
console.log("Response:", data);
```

## Next Steps

1. **Deploy to Cloudflare Workers**: Your AI integration runs globally
2. **Configure monitoring**: Set up alerts for failures and usage
3. **Scale your models**: Add load balancing and auto-scaling
4. **Add more models**: Extend support for new AI providers
5. **Custom UI**: Build specialized interfaces for your use cases

## Support

- Check the [main README](../README.md) for general setup
- Review [server actions patterns](./SERVER_ACTIONS.md)
- Explore [Cloudflare Workers docs](https://developers.cloudflare.com/workers/)

---

This integration demonstrates the power of combining self-hosted AI models with Cloudflare's global edge infrastructure, providing a scalable, secure, and cost-effective solution for AI-powered SaaS applications. 