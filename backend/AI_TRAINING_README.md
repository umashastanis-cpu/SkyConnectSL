# AI Agent Training Guide

## ⚠️ Production Readiness Notice

**This AI backend is a DEMO/MVP version and is NOT production-ready.**

### What's Working ✅
- LangChain AI agent with ReAct pattern
- ChromaDB vector database for semantic search
- HuggingFace embeddings (all-MiniLM-L6-v2)
- 5 custom AI tools (search, details, travel guide, preferences, availability)
- Comprehensive Sri Lanka travel knowledge base
- FastAPI endpoints for AI chat, search, recommendations

### What's Missing ❌
- **Authentication & Authorization** (ALL endpoints are public!)
- **Rate Limiting** (vulnerable to abuse & cost explosion)
- **Input Validation** (prompt injection possible)
- **Comprehensive Testing** (0% test coverage)
- **Production Monitoring** (no logging, metrics, alerts)
- **Error Handling** (exposes implementation details)
- **RBAC** (no role-based access control)

**Security Risk Score: 8.5/10 (HIGH)**

See `BACKEND_QA_ANALYSIS.md` for complete audit.

---

## Training the AI Agent

### Prerequisites
1. Python 3.11+ environment activated
2. All dependencies installed (`pip install -r requirements.txt`)
3. Firebase configured (`config/serviceAccountKey.json`)
4. Firestore populated with listings and partners

### Step 1: Train Knowledge Base (Embeddings)

```powershell
# Navigate to backend directory
cd backend

# Run training script
C:/Users/Hp/Desktop/SkyConnectSL/.venv/Scripts/python.exe train_bot.py
```

**What this does:**
- Embeds all **listings** from Firestore into ChromaDB
- Embeds all **partner profiles** into ChromaDB
- Embeds comprehensive **Sri Lanka travel guide** (6 sections: attractions, culture, practical info, regional guides, activities, seasonal)
- Creates vector indexes for semantic search

**Expected output:**
```
Starting AI knowledge base training...
Training listings...
Trained 45 listings
Training partners...
Trained 23 partners
Training travel guide...
Trained 6 travel guide sections
✓ Training complete! Knowledge base ready.
```

**Time:** ~5-10 minutes (first run downloads embeddings model ~90MB)

### Step 2: Start Backend Server

```powershell
# From backend directory
C:/Users/Hp/Desktop/SkyConnectSL/.venv/Scripts/python.exe main.py
```

**Server will start on:** `http://localhost:8000`

**View API docs:** `http://localhost:8000/docs`

### Step 3: Test AI Chat

**Option A: Using API Docs (Swagger UI)**
1. Go to `http://localhost:8000/docs`
2. Find `POST /api/chat` endpoint
3. Click "Try it out"
4. Enter test message:
```json
{
  "message": "Find romantic beach resorts in Galle under $150/night",
  "user_id": "test_user_123"
}
```
5. Click "Execute"

**Option B: Using cURL**
```powershell
curl -X POST "http://localhost:8000/api/chat" `
  -H "Content-Type: application/json" `
  -d '{"message": "Find romantic beach resorts in Galle under $150/night", "user_id": "test_user_123"}'
```

**Expected Response:**
```json
{
  "response": "I found several romantic beach resorts in Galle...",
  "sources": [
    {"listing_id": "...", "title": "..."},
    ...
  ],
  "agent_type": "travel_concierge"
}
```

---

## How the AI Agent Works

### Architecture
```
User Query
    ↓
FastAPI Endpoint (/api/chat)
    ↓
Travel Concierge Agent (LangChain ReAct)
    ↓
[Tool Selection]
    ├─ SearchListingsTool (semantic search via ChromaDB)
    ├─ GetListingDetailsTool (Firestore lookup)
    ├─ TravelGuideTool (embedded knowledge)
    ├─ GetUserPreferencesTool (user profile)
    └─ CheckAvailabilityTool (booking check)
    ↓
Agent Reasoning (ReAct loop)
    ↓
Final Response + Sources
```

### Training Method: NO Traditional ML Training Needed!

**We use:**
1. **Prompt Engineering** - Pre-written system prompts guide agent behavior
2. **Vector Embeddings** - HuggingFace model creates semantic search index
3. **RAG (Retrieval Augmented Generation)** - Agent retrieves relevant context before answering

**We DON'T need:**
- Traditional ML model training
- Labeled datasets
- GPU training
- Fine-tuning
- Gradient descent

**Why?** The LLM (Ollama llama3.2) is already trained. We just:
- Give it travel-specific instructions (prompts)
- Provide searchable knowledge base (embeddings)
- Equip it with tools to access data

### LLM Options

**Option 1: Ollama (Free, Local) ⭐ RECOMMENDED FOR DEMO**
```powershell
# Install Ollama from https://ollama.ai
ollama pull llama3.2
```
- Free, unlimited usage
- Runs on your machine
- Good quality (7B parameters)
- Privacy (no data sent to cloud)

**Option 2: GPT-4 (Paid, Best Quality)**
- Set `OPENAI_API_KEY` environment variable
- ~$0.03/1K tokens
- Superior reasoning
- Requires internet

**Option 3: Groq (Free Tier, Fast)**
- Set `GROQ_API_KEY` environment variable
- Free tier: 30 requests/min
- Very fast inference
- Requires internet

---

## Testing Scenarios

### Scenario 1: Destination Search
```json
{"message": "I want to visit Sri Lanka in December. What are the best beaches?"}
```
**Expected:** Agent uses TravelGuideTool, provides seasonal beach recommendations

### Scenario 2: Listing Search
```json
{"message": "Find luxury hotels in Colombo with pool"}
```
**Expected:** Agent uses SearchListingsTool, returns relevant listings from ChromaDB

### Scenario 3: Budget Planning
```json
{"message": "I have $2000 budget for 7 days. Plan my trip to Kandy and Ella"}
```
**Expected:** Agent uses multiple tools, calculates costs, suggests itinerary

### Scenario 4: Activity Booking
```json
{"message": "Book whale watching tour in Mirissa for 2 people on March 15"}
```
**Expected:** Agent uses GetListingDetailsTool + CheckAvailabilityTool

---

## Monitoring AI Performance

### Check Knowledge Base
```powershell
# Search embeddings directly
curl -X POST "http://localhost:8000/api/search/semantic" `
  -H "Content-Type: application/json" `
  -d '{"query": "beach resorts", "limit": 5}'
```

### Get Personalized Recommendations
```powershell
curl -X POST "http://localhost:8000/api/recommend" `
  -H "Content-Type: application/json" `
  -d '{"user_id": "test_user_123", "limit": 5}'
```

### Train New Data (Admin)
```powershell
curl -X POST "http://localhost:8000/api/admin/train"
```

---

## Troubleshooting

### Issue: "LLM not initialized"
**Solution:** 
1. Install Ollama and run `ollama pull llama3.2`
2. OR set `OPENAI_API_KEY` environment variable

### Issue: "ChromaDB collection not found"
**Solution:** Run `train_bot.py` first to create embeddings

### Issue: "No listings found"
**Solution:** Populate Firestore with listing data first

### Issue: Agent gives generic answers
**Solution:**
1. Check if knowledge base is trained (`train_bot.py`)
2. Verify Firestore has data
3. Review prompts in `services/ai/prompts.py`

### Issue: Slow responses
**Solution:**
- Use Groq API (faster than local Ollama)
- Reduce ChromaDB search results (`k=5` → `k=3`)
- Use smaller Ollama model (`llama3.2:1b`)

---

## Production Deployment Checklist

**DO NOT deploy to production without implementing:**

### Phase 1: Critical Security (2-3 weeks)
- [ ] JWT authentication on all endpoints
- [ ] Rate limiting (10 req/min per user, 100/min for search)
- [ ] Input validation & sanitization (Pydantic models)
- [ ] RBAC middleware (user/partner/admin roles)
- [ ] API key authentication for admin endpoints
- [ ] Request timeout enforcement
- [ ] CORS configuration

### Phase 2: Quality Assurance (1-2 weeks)
- [ ] Unit tests (pytest) - target 80% coverage
- [ ] Integration tests for AI endpoints
- [ ] Load testing (locust) - 100 concurrent users
- [ ] Security testing (OWASP top 10)
- [ ] Error handling review
- [ ] Logging implementation (structured JSON logs)

### Phase 3: Production Readiness (1-2 weeks)
- [ ] Monitoring (Sentry, NewRelic, or DataDog)
- [ ] Health check endpoints
- [ ] Graceful shutdown handling
- [ ] Database connection pooling
- [ ] Background task queues (Celery)
- [ ] Caching layer (Redis)
- [ ] API documentation
- [ ] Deployment pipeline (CI/CD)

### Phase 4: Business Logic (2-3 weeks)
- [ ] Complete booking workflow
- [ ] Payment integration
- [ ] Review & rating system
- [ ] Email notifications
- [ ] Partner verification workflow
- [ ] Conflict resolution

**Total Time to Production:** ~8-10 weeks

---

## Current Status

| Component | Status | Production Ready? |
|-----------|--------|-------------------|
| AI Agent | ✅ Working | ⚠️ Demo Only |
| Vector Search | ✅ Working | ⚠️ Demo Only |
| Knowledge Base | ✅ Working | ⚠️ Demo Only |
| API Endpoints | ✅ Working | ❌ No Auth |
| Security | ❌ Missing | ❌ Critical Risk |
| Testing | ❌ None | ❌ Critical Risk |
| Monitoring | ❌ None | ❌ High Risk |
| Business Logic | ⚠️ Partial | ❌ Incomplete |

**Overall: 35% Production Ready**

---

## Safe Usage Guidelines

### ✅ Safe For:
- Local development and testing
- Portfolio demonstrations
- Investor presentations
- Learning LangChain/AI development
- Proof of concept showcases

### ❌ NOT Safe For:
- Public internet deployment
- Real customer data
- Real payment processing
- Production user accounts
- Unsupervised operation

---

## Questions?

**For AI-specific issues:** Review `AI_AGENT_USE_CASES.md`  
**For production readiness:** Review `BACKEND_QA_ANALYSIS.md`  
**For implementation details:** Check code comments in `backend/services/ai/`

---

**Last Updated:** February 2026  
**Backend Version:** 1.0.0-DEMO  
**Production Ready:** NO (35%)  
**Security Risk:** HIGH (8.5/10)
