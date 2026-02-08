# 🚀 Google Gemini & ChatGPT Setup Guide

## Perfect for Your Situation!

Since your PC cannot run Ollama, both Gemini and ChatGPT are **excellent cloud alternatives** that require ZERO PC resources.

---

## 🌟 Option 1: Google Gemini (RECOMMENDED!)

### Why Gemini is Perfect for You

- ✅ **100% FREE** with generous limits
- ✅ **60 requests/minute** (2x more than Groq!)
- ✅ **No credit card** required
- ✅ **Good quality** (comparable to GPT-3.5)
- ✅ **Zero PC resources** needed
- ✅ **Fast setup** (3 minutes)
- ✅ **Great for demos** and development

### Gemini Setup (3 minutes)

#### Step 1: Get FREE API Key

1. Go to **https://aistudio.google.com/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)

#### Step 2: Install Gemini Package

```powershell
# From your project root
C:/Users/Hp/Desktop/SkyConnectSL/.venv/Scripts/python.exe -m pip install langchain-google-genai
```

#### Step 3: Set Environment Variable

**Option A: Temporary (this session only)**
```powershell
$env:GOOGLE_API_KEY = "AIzaSy...your_key_here"
```

**Option B: Permanent (recommended)**
```powershell
[System.Environment]::SetEnvironmentVariable('GOOGLE_API_KEY', 'AIzaSy...your_key_here', 'User')
```

**Option C: Add to .env file**
```powershell
# Add to backend/.env
Add-Content -Path "backend\.env" -Value "GOOGLE_API_KEY=AIzaSy...your_key_here"
```

#### Step 4: Restart Backend Server

```powershell
# Kill current server (Ctrl+C in server terminal)
# Then restart:
C:/Users/Hp/Desktop/SkyConnectSL/.venv/Scripts/python.exe backend/main.py
```

**You should see:**
```
🔍 Attempting to connect to Google Gemini...
✅ Connected to Google Gemini (gemini-1.5-flash) - FREE tier ⭐
   Rate limit: 60 requests/minute
✅ Agent executor created successfully
```

#### Step 5: Test AI Chat!

```powershell
curl -X POST "http://localhost:8000/api/chat" `
  -H "Content-Type: application/json" `
  -d '{"message": "Find me romantic beach resorts in Galle and explain why they are good", "user_id": "test"}'
```

### Gemini Free Tier Limits

| Feature | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Requests/minute** | 60 | 1000+ |
| **Requests/day** | 1500 | Unlimited |
| **Cost** | FREE | $0.00002/1K chars |
| **Credit card** | Not required | Optional |
| **Model** | gemini-1.5-flash | All models |

**Perfect for:** Demos, development, testing, portfolio

**Upgrade when:** You need more than 1500 requests/day

---

## 💎 Option 2: OpenAI ChatGPT (Premium Quality)

### Why ChatGPT

- ✅ **Best quality** available (GPT-4)
- ✅ **Most reliable** and stable
- ✅ **Best reasoning** abilities
- ✅ **Zero PC resources** needed
- ❌ **Requires payment** (~$0.03/1000 tokens)
- ❌ **Credit card** required ($5 minimum)

### ChatGPT Setup (5 minutes + payment)

#### Step 1: Get API Key

1. Go to **https://platform.openai.com**
2. Sign up / Sign in
3. Go to **"API Keys"** section
4. Click **"Create new secret key"**
5. Copy the key (starts with `sk-...`)
6. **Add payment method** (minimum $5)

#### Step 2: Install OpenAI Package

```powershell
C:/Users/Hp/Desktop/SkyConnectSL/.venv/Scripts/python.exe -m pip install langchain-openai
```

#### Step 3: Set Environment Variable

**Permanent (recommended):**
```powershell
[System.Environment]::SetEnvironmentVariable('OPENAI_API_KEY', 'sk-...your_key_here', 'User')
```

**Or add to .env:**
```powershell
Add-Content -Path "backend\.env" -Value "OPENAI_API_KEY=sk-...your_key_here"
```

#### Step 4: Restart Backend

```powershell
C:/Users/Hp/Desktop/SkyConnectSL/.venv/Scripts/python.exe backend/main.py
```

**You should see:**
```
🔍 Attempting to connect to OpenAI ChatGPT...
✅ Connected to OpenAI ChatGPT (gpt-4o) - PAID
✅ Agent executor created successfully
```

### ChatGPT Pricing

| Model | Input | Output | Quality |
|-------|-------|--------|---------|
| **gpt-4o** | $2.50/1M tokens | $10/1M tokens | ⭐⭐⭐⭐⭐ Best |
| **gpt-4o-mini** | $0.15/1M tokens | $0.60/1M tokens | ⭐⭐⭐⭐ Great |
| **gpt-3.5-turbo** | $0.50/1M tokens | $1.50/1M tokens | ⭐⭐⭐ Good |

**Example cost:** 1000 demo conversations ≈ $5-15

---

## 📊 Complete Comparison

| Feature | Gemini FREE ⭐ | ChatGPT (GPT-4) | Groq FREE | SimpleFallback |
|---------|---------------|-----------------|-----------|----------------|
| **Cost** | FREE | ~$0.03/1K | FREE | FREE |
| **Setup Time** | 3 min | 5 min + payment | 5 min | 0 (done!) |
| **Requests/min** | 60 | 500+ | 30 | Unlimited |
| **Your PC usage** | 0% | 0% | 0% | 0% |
| **Quality** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Conversations** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Reasoning** | ✅ Good | ✅ Best | ✅ Good | ❌ No |
| **Credit card** | ❌ No | ✅ Required | ❌ No | ❌ No |
| **Internet needed** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Best for** | **Demos/Dev** | Production | Dev/Testing | Quick tests |

---

## 🎯 Which Should You Choose?

### For Right Now (Free, No Payment):
**🥇 Google Gemini** - Best FREE option!
- Setup: 3 minutes
- Quality: Excellent
- Limits: 60 req/min (plenty for demos)
- Cost: $0

### For Production (Best Quality):
**🥈 OpenAI ChatGPT (GPT-4o)**
- Highest quality responses
- Most reliable
- Cost: Manageable (~$5-20/month for small app)

### For Development/Testing:
**🥉 Groq FREE**
- Good quality
- Very fast
- 30 req/min limit

### For Quick Demos (Current):
**SimpleFallbackAgent** (already working!)
- Instant responses
- No API calls
- Works offline

---

## 🚀 Quick Start: Gemini (Recommended)

**Complete setup in 3 minutes:**

```powershell
# 1. Get API key
# Go to: https://aistudio.google.com/apikey
# Click "Create API Key"
# Copy the key

# 2. Install package
C:/Users/Hp/Desktop/SkyConnectSL/.venv/Scripts/python.exe -m pip install langchain-google-genai

# 3. Set key (replace with your actual key)
$env:GOOGLE_API_KEY = "AIzaSy...your_actual_key_here"

# 4. Restart backend
C:/Users/Hp/Desktop/SkyConnectSL/.venv/Scripts/python.exe backend/main.py

# 5. Test it!
# Open http://localhost:8000/docs
# Try POST /api/chat endpoint
```

**Done! You now have full AI conversations with Google Gemini!**

---

## 🧪 Testing Your Setup

### Test 1: Simple Query
```json
{
  "message": "Hello! Can you help me find hotels in Colombo?",
  "user_id": "test_user"
}
```

**Expected:** Conversational response with search results

### Test 2: Complex Reasoning
```json
{
  "message": "Compare beach resorts in Galle vs Mirissa. Which is better for families with kids?",
  "user_id": "test_user"
}
```

**Expected:** Multi-step reasoning comparing both locations

### Test 3: Conversation Memory
```json
// First message
{
  "message": "I'm looking for beach resorts",
  "user_id": "test_user",
  "conversation_id": "conv_123"
}

// Second message (remembers context)
{
  "message": "Which one has the best reviews?",
  "user_id": "test_user",
  "conversation_id": "conv_123"
}
```

**Expected:** Agent remembers previous context

---

## 🔧 Troubleshooting

### Gemini Issues

**Error: "API key not valid"**
```powershell
# Verify key is set correctly
echo $env:GOOGLE_API_KEY

# Should show: AIzaSy...
# If empty, set it again
```

**Error: "Rate limit exceeded"**
- Free tier: 60 requests/minute
- Wait 60 seconds or upgrade to paid tier
- For testing, wait between requests

**Error: "Package not found"**
```powershell
# Install the package
pip install langchain-google-genai
```

### ChatGPT Issues

**Error: "Incorrect API key"**
- Check key starts with `sk-`
- Verify on platform.openai.com
- Regenerate key if needed

**Error: "Insufficient quota"**
- Add credits to your account
- Minimum $5 required

**Error: "Rate limit"**
- Depends on your tier
- Free tier: 3 req/min
- Paid tier: Much higher

---

## 💡 Pro Tips

### 1. Start with Gemini FREE
- Test everything works
- Show demos to investors
- Develop your app
- FREE tier is usually enough

### 2. Switch Models Easily
Just change environment variable:
```powershell
# Use Gemini
$env:GOOGLE_API_KEY = "..."

# Switch to ChatGPT
Remove-Item Env:\GOOGLE_API_KEY
$env:OPENAI_API_KEY = "sk-..."

# Restart backend to apply changes
```

### 3. Cost Monitoring

**Gemini:**
- Check usage: https://aistudio.google.com
- FREE tier shows remaining quota

**ChatGPT:**
- Check usage: https://platform.openai.com/usage
- Set spending limits in settings

### 4. Mix and Match
You can set multiple API keys:
```powershell
$env:GOOGLE_API_KEY = "..."
$env:GROQ_API_KEY = "..."
$env:OPENAI_API_KEY = "..."
```

Backend will try Gemini first, then Groq, then OpenAI!

---

## 📋 Summary

### Your Best Path Forward:

1. **Today (3 minutes):**
   - ✅ Set up Google Gemini FREE
   - ✅ Get full AI conversations
   - ✅ No payment required
   - ✅ 60 requests/min is plenty

2. **For Demos:**
   - ✅ Gemini works perfectly
   - ✅ Show investors
   - ✅ Build portfolio
   - ✅ Test all features

3. **For Production (later):**
   - Consider ChatGPT if quality critical
   - Or stick with Gemini (very good!)
   - Or upgrade Gemini to paid tier

---

## 🎉 You're All Set!

**Your backend now supports:**
- ✅ Google Gemini (FREE - recommended!)
- ✅ OpenAI ChatGPT (paid, best quality)
- ✅ Groq (FREE alternative)
- ✅ SimpleFallbackAgent (no LLM needed)

**No Ollama needed - your PC limitations are NOT a problem!**

---

## 🔗 Quick Links

- **Gemini API Keys:** https://aistudio.google.com/apikey
- **Gemini Docs:** https://ai.google.dev/
- **OpenAI API Keys:** https://platform.openai.com/api-keys
- **OpenAI Pricing:** https://openai.com/pricing
- **Groq Console:** https://console.groq.com

---

## ❓ Need Help?

**Check which provider is active:**
```powershell
# Look at backend startup logs
# You'll see: "✅ Connected to Google Gemini..." or similar
```

**Test if it's working:**
```powershell
# Go to http://localhost:8000/docs
# Try POST /api/chat
# Check the response for "llm_provider" field
```

**Questions?** See NO_OLLAMA_GUIDE.md for more options.

---

**🌟 Recommended: Start with Gemini FREE - setup in 3 minutes!**

Get your API key: https://aistudio.google.com/apikey
