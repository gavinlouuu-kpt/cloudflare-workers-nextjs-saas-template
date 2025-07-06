# Quick Setup Guide: Ollama on Mac Mini M1

This guide will help you quickly set up a local AI model on your Mac Mini M1 for testing the AI integration.

## 🚀 5-Minute Setup

### Step 1: Install Ollama

```bash
# Install via Homebrew (recommended)
brew install ollama

# Or download from: https://ollama.ai/download
```

### Step 2: Pull a Small Model

Start with the tiniest model for fastest testing:

```bash
# Ultra-fast, tiny model (~300MB) - Great for testing!
ollama pull qwen2.5:0.5b

# Slightly bigger but better quality (~700MB)
ollama pull llama3.2:1b

# Best balance for M1 (~2GB)
ollama pull llama3.2:3b
```

**Recommendation**: Start with `qwen2.5:0.5b` - it's incredibly fast on M1!

### Step 3: Start Ollama Server

```bash
# Start the server (keep this running)
ollama serve
```

**You'll see**: `Ollama server running on http://localhost:11434`

### Step 4: Test Your Model

```bash
# Quick test
ollama run qwen2.5:0.5b "Hello! How are you?"
```

### Step 5: Start Your Next.js App

```bash
# In your project directory
pnpm dev
```

### Step 6: Test the Integration

1. Go to `http://localhost:3000/sign-up` and create an account
2. Navigate to `http://localhost:3000/dashboard/ai-chat`
3. Select `qwen2.5:0.5b` from the model dropdown
4. Send a message like "Hello, world!"

## 🎯 Expected Performance on Mac Mini M1

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| `qwen2.5:0.5b` | 300MB | ⚡⚡⚡ Ultra Fast | ⭐⭐ Basic | Testing, demos |
| `llama3.2:1b` | 700MB | ⚡⚡ Very Fast | ⭐⭐⭐ Good | Quick tasks |
| `llama3.2:3b` | 2GB | ⚡ Fast | ⭐⭐⭐⭐ Great | Real usage |

## 🔧 Configuration Details

The integration is pre-configured for Ollama:

```javascript
// Already set in wrangler.jsonc
"LLAMA_API_URL": "http://localhost:11434/v1/chat/completions"
```

Models configured:
- `qwen2.5:0.5b` - 1 credit per request
- `llama3.2:1b` - 2 credits per request  
- `llama3.2:3b` - 5 credits per request
- `phi3:mini` - 3 credits per request

## 🐛 Troubleshooting

### "Connection refused" error
```bash
# Make sure Ollama is running
ollama serve
```

### "Model not found" error
```bash
# Pull the model first
ollama pull qwen2.5:0.5b
```

### "Insufficient credits" error
- Sign up creates account with some free credits
- Go to `/dashboard/billing` to purchase more credits
- Or adjust `creditCost` in `src/actions/ai-model.actions.ts` for testing

### Model is slow
- Try `qwen2.5:0.5b` - it's the fastest
- Ensure no other heavy apps are running
- M1 Mac Mini should handle these models easily

## 📊 Testing Different Models

Once you have one working, try others:

```bash
# Microsoft's small model
ollama pull phi3:mini
ollama run phi3:mini "Explain quantum computing simply"

# Google's efficient model  
ollama pull gemma2:2b
```

## 🎨 Customization

Want to add more models? Edit `src/actions/ai-model.actions.ts`:

```typescript
const MODEL_CONFIG = {
  'your-new-model': {
    apiUrl: process.env.LLAMA_API_URL || 'http://localhost:11434/v1/chat/completions',
    apiKey: '',
    creditCost: 1,
    getHeaders: () => ({ 'Content-Type': 'application/json' }),
  },
}
```

And update the schema in `src/schemas/ai-model.schema.ts`:

```typescript
model: z.enum(['qwen2.5:0.5b', 'llama3.2:1b', 'your-new-model'])
```

## 🚀 Next Steps

Once this works locally:

1. **Deploy to Cloudflare**: Use a public Ollama server URL
2. **Add API authentication**: Secure your model endpoints  
3. **Monitor usage**: Check the transaction logs
4. **Scale up**: Try larger, more capable models
5. **Add streaming**: Implement real-time responses

## 💡 Pro Tips for M1 Mac Mini

- **Memory**: 16GB+ recommended for 3B+ models
- **Models**: Stick to 3B or smaller for best performance
- **Cooling**: Ensure good ventilation during heavy use
- **Power**: M1 is very efficient - great for local AI hosting!

Happy testing! 🎉 