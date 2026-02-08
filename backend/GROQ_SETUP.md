# Groq Setup Guide - Free Cloud LLM

## Why Groq?
- ✅ **FREE tier:** 30 requests/minute
- ✅ **Very fast:** Fastest inference available
- ✅ **No local resources:** Runs in the cloud
- ✅ **Good quality:** Uses Llama 3.1 70B model
- ✅ **Easy setup:** Just API key needed

## Setup Steps (5 minutes)

### 1. Get Free API Key

1. Go to **https://console.groq.com**
2. Sign up (it's free)
3. Navigate to "API Keys"
4. Click "Create API Key"
5. Copy the key (starts with `gsk_...`)

### 2. Set Environment Variable

**Option A: Temporary (this session only)**
```powershell
$env:GROQ_API_KEY = "gsk_your_key_here"
```

**Option B: Permanent (recommended)**
```powershell
# Add to your PowerShell profile
[System.Environment]::SetEnvironmentVariable('GROQ_API_KEY', 'gsk_your_key_here', 'User')
```

**Option C: Add to .env file**
```powershell
# Create/edit .env file in backend folder
Add-Content -Path "backend\.env" -Value "GROQ_API_KEY=gsk_your_key_here"
```

### 3. Update Agent Code

Your agent is already configured to use Groq! Just need to uncomment it.

Open `backend/services/ai/agent.py` and you'll see it already supports Groq as fallback.

### 4. Restart Backend Server

```powershell
# Kill current server (if running)
# Then restart:
C:/Users/Hp/Desktop/SkyConnectSL/.venv/Scripts/python.exe backend/main.py
```

### 5. Test AI Chat

The agent will now use Groq instead of local Ollama!

```powershell
curl -X POST "http://localhost:8000/api/chat" `
  -H "Content-Type: application/json" `
  -d '{"message": "Find beach resorts in Galle", "user_id": "test_user"}'
```

## Groq Free Tier Limits

- **30 requests/minute** - Perfect for demos and development
- **No credit card required**
- **Models available:**
  - llama3-70b-8192 (recommended)
  - mixtral-8x7b-32768
  - gemma-7b-it

## Comparison: Groq vs Ollama vs OpenAI

| Feature | Groq (Free) | Ollama (Free) | OpenAI (Paid) |
|---------|-------------|---------------|---------------|
| Cost | FREE | FREE | ~$0.03/1k tokens |
| Speed | ⚡⚡⚡ Very Fast | 🐌 Slow | ⚡⚡ Fast |
| Quality | ⭐⭐⭐⭐ Good | ⭐⭐⭐ OK | ⭐⭐⭐⭐⭐ Best |
| CPU/RAM | ✅ None | ❌ High | ✅ None |
| Internet | Required | Not needed | Required |
| Rate Limit | 30/min | Unlimited | Depends on tier |
| Best For | **Demos & Dev** | Production | Production |

## Troubleshooting

**Issue: "Invalid API key"**
- Check key is correct
- Ensure no extra spaces
- Verify environment variable is set: `echo $env:GROQ_API_KEY`

**Issue: "Rate limit exceeded"**
- Free tier: 30 requests/minute
- Wait 60 seconds or upgrade to paid tier

**Issue: "Connection timeout"**
- Check internet connection
- Groq requires internet access

## Next Steps

1. ✅ Get API key from console.groq.com
2. ✅ Set environment variable
3. ✅ Restart backend
4. ✅ Test with /api/chat endpoint
5. 🎉 Enjoy full AI agent without local resources!

**No PC resources needed - everything runs in Groq's cloud!**
