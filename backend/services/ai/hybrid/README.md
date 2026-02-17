# Hybrid AI System - Complete Implementation Guide

## 🎯 System Overview

A production-grade hybrid AI architecture for SkyConnect SL that combines:
- **Deterministic Database Logic** for analytics and structured data
- **RAG (Retrieval-Augmented Generation)** for policies and help documents
- **LLM Formatting** for conversational responses
- **Strict Role-Based Access Control**
- **Resilient LLM Fallback** (Groq → Gemini)

## 📐 Architecture

```
User Query
    ↓
┌─────────────────────────────────────────────┐
│ 1. Intent Classifier                        │
│    • Hybrid: Keyword + Embedding            │
│    • 8 supported intents                    │
│    • Confidence scoring                     │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ 2. Role Validator                           │
│    • Traveler/Partner/Admin                 │
│    • Strict access control                  │
│    • Resource ownership validation          │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ 3. Query Router                             │
│    • Route to DB or RAG                     │
│    • Prevent cross-contamination            │
└─────────────────┬───────────────────────────┘
                  ↓
    ┌─────────────┴──────────────┐
    ↓                            ↓
┌──────────────────┐    ┌──────────────────┐
│ Database Engine  │    │   RAG Engine     │
│ • Analytics      │    │   • Policies     │
│ • Revenue        │    │   • Help docs    │
│ • User data      │    │   • Guides       │
│ NO LLM!          │    │   + LLM synthesis│
└────────┬─────────┘    └────────┬─────────┘
         └────────────┬───────────┘
                      ↓
         ┌──────────────────────┐
         │ LLM Provider         │
         │ Groq → Gemini        │
         │ (formatting only)    │
         └──────────┬───────────┘
                    ↓
         Structured JSON Response
```

## 🗂️ File Structure

```
backend/services/ai/hybrid/
├── __init__.py                    # Main HybridAISystem orchestrator
├── intent_classifier.py           # Intent classification (keyword + embedding)
├── role_validator.py              # Role-based access control
├── query_router.py                # Query routing logic
├── data_engine.py                 # Deterministic database operations
├── rag_engine.py                  # RAG with containment
├── llm_provider_fallback.py       # Groq → Gemini fallback
├── api_endpoint.py                # FastAPI routes
├── monitoring.py                  # Logging and metrics
└── README.md                      # This file
```

## 🚀 Quick Start

### 1. Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Required packages:
# - fastapi
# - langchain
# - langchain-groq
# - google-generativeai
# - chromadb
# - sentence-transformers
# - firebase-admin
```

### 2. Environment Setup

Create `.env` file:

```env
# Groq API (primary LLM)
GROQ_API_KEY=your_groq_api_key_here

# Gemini API (fallback LLM)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Admin
FIREBASE_CREDENTIALS_PATH=config/serviceAccountKey.json
```

### 3. Initialize System

```python
from services.ai.hybrid import HybridAISystem
from config.firebase_admin import db as firestore_service
from services.ai.embeddings import get_chroma_client

# Initialize system
ai_system = HybridAISystem(
    firestore_service=firestore_service,
    chroma_client=get_chroma_client()
)
```

### 4. Process Queries

```python
# Traveler query (recommendations)
response = await ai_system.query(
    query="Show me luxury beach resorts in Sri Lanka",
    user_id="traveler_001",
    role="traveler"
)

print(response.to_dict())
# {
#     "intent": "recommendation_query",
#     "role_scope": "traveler",
#     "data_source": "database",
#     "response": "Here are 5 luxury beach resorts...",
#     "metadata": {
#         "latency_ms": 234.56,
#         "intent_confidence": 0.95
#     }
# }
```

## 📊 Supported Intents

### 1️⃣ Recommendation Query
**Query:** "Show me beach resorts", "Find adventure experiences"  
**Data Source:** Database  
**Roles:** Traveler, Partner, Admin  

### 2️⃣ Saved Items Query
**Query:** "What have I bookmarked?", "My saved hotels"  
**Data Source:** Database  
**Roles:** Traveler  

### 3️⃣ Analytics Query
**Query:** "How many views did I get?", "Show my stats"  
**Data Source:** Database  
**Roles:** Partner (own data), Admin (system-wide)  

### 4️⃣ Revenue Query
**Query:** "What's my earnings?", "Total revenue this month"  
**Data Source:** Database  
**Roles:** Partner (own data), Admin (system-wide)  

### 5️⃣ Moderation Query
**Query:** "Show pending partners", "Review flagged content"  
**Data Source:** Database  
**Roles:** Admin only  

### 6️⃣ Policy Query
**Query:** "What's the refund policy?", "PDPA compliance"  
**Data Source:** RAG (ChromaDB + LLM)  
**Roles:** All  

### 7️⃣ Navigation Query
**Query:** "How do I upload photos?", "Where can I edit profile?"  
**Data Source:** RAG (ChromaDB + LLM)  
**Roles:** All  

### 8️⃣ Troubleshooting Query
**Query:** "Why can't I submit?", "Error uploading images"  
**Data Source:** RAG (ChromaDB + LLM)  
**Roles:** All  

## 🔒 Role-Based Access Control

| Intent            | Traveler | Partner | Admin |
|-------------------|----------|---------|-------|
| Recommendation    | ✅       | ✅      | ✅    |
| Saved Items       | ✅       | ❌      | ❌    |
| Analytics         | ❌       | ✅*     | ✅    |
| Revenue           | ❌       | ✅*     | ✅    |
| Moderation        | ❌       | ❌      | ✅    |
| Policy            | ✅       | ✅      | ✅    |
| Navigation        | ✅       | ✅      | ✅    |
| Troubleshooting   | ✅       | ✅      | ✅    |

*Partners can only access their own data

## 🛡️ Security Features

### 1. Role Isolation
```python
# Partners cannot access other partners' data
response = await ai_system.query(
    query="Show analytics",
    user_id="partner_001",
    role="partner",
    partner_id="partner_002"  # Different partner!
)
# Result: Access denied (scope violation)
```

### 2. Intent Containment
```python
# RAG engine refuses analytics queries
# Prevents hallucinated numbers
response = await rag_engine.query(
    query="What's my revenue?",
    intent=Intent.REVENUE
)
# Result: "I cannot provide analytics or revenue data"
```

### 3. LLM Formatting Only
```python
# LLM receives data as read-only context
# Cannot modify or generate numbers
db_data = {"total_views": 1234, "total_bookings": 56}
formatted = await llm.format(data=db_data)
# LLM formats, doesn't generate
```

## 📡 API Endpoints

### POST /api/ai/query

**Request:**
```json
{
    "query": "Show me beach resorts in Sri Lanka",
    "user_id": "user123",
    "role": "traveler",
    "include_raw_data": false
}
```

**Response:**
```json
{
    "intent": "recommendation_query",
    "role_scope": "traveler",
    "data_source": "database",
    "response": "Here are 5 luxury beach resorts in Sri Lanka...",
    "metadata": {
        "latency_ms": 234.56,
        "intent_confidence": 0.95,
        "classification_method": "keyword",
        "record_count": 5
    }
}
```

### GET /api/ai/stats

**Response:**
```json
{
    "llm_provider": {
        "groq_success": 42,
        "gemini_fallback": 3,
        "fallback_rate": 0.067,
        "success_rate": 1.0
    },
    "uptime_seconds": 3600
}
```

### GET /api/ai/health

**Response:**
```json
{
    "status": "healthy",
    "healthy": true,
    "uptime_seconds": 3600
}
```

### GET /api/ai/examples

Returns example queries for testing.

## 🧪 Testing Examples

### Traveler: Recommendations
```bash
curl -X POST http://localhost:8000/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Show me luxury beach resorts in Sri Lanka",
    "user_id": "traveler_001",
    "role": "traveler"
  }'
```

### Partner: Analytics
```bash
curl -X POST http://localhost:8000/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How many views did my listings get this week?",
    "user_id": "partner_001",
    "role": "partner",
    "partner_id": "partner_001"
  }'
```

### Admin: Moderation
```bash
curl -X POST http://localhost:8000/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Show pending partner applications",
    "user_id": "admin_001",
    "role": "admin"
  }'
```

### Policy Question
```bash
curl -X POST http://localhost:8000/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the refund policy for cancellations?",
    "user_id": "traveler_001",
    "role": "traveler"
  }'
```

## 📈 Performance Characteristics

| Component            | Latency (P95) | Notes                          |
|----------------------|---------------|--------------------------------|
| Intent Classification| 150ms         | Keyword: 0.1ms, Embedding: 100ms|
| Role Validation      | 1ms           | In-memory validation           |
| Database Query       | 50-200ms      | Indexed Firestore queries      |
| RAG Search           | 100-300ms     | ChromaDB semantic search       |
| LLM Groq             | 200-500ms     | Fast inference                 |
| LLM Gemini (fallback)| 500-1500ms    | Slower but reliable            |
| **Total (DB queries)**| **300-700ms** | Most queries                   |
| **Total (RAG queries)**| **600-1800ms**| Policy/help queries            |

## 🔧 Configuration

### Intent Classification
```python
classifier = IntentClassifier(
    embedding_model="all-MiniLM-L6-v2",  # HuggingFace model
    confidence_threshold=0.6              # Minimum confidence
)
```

### LLM Provider
```python
llm = HybridLLMProvider(
    groq_api_key="...",
    gemini_api_key="..."
)

# Groq configuration
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_TIMEOUT = 10  # seconds

# Gemini configuration
GEMINI_MODEL = "gemini-1.5-flash"
GEMINI_TIMEOUT = 10  # seconds
```

### RAG Engine
```python
rag = RAGEngine(
    chroma_client=chroma_client,
    llm_provider=llm_provider,
    similarity_threshold=0.75  # High threshold for relevance
)
```

## 📝 Logging

All events are logged in structured JSON format:

```json
{
    "timestamp": "2026-02-14T10:30:00.000Z",
    "component": "hybrid_ai",
    "event_type": "query_complete",
    "message": "Query completed (234.56ms)",
    "latency_ms": 234.56,
    "intent": "recommendation_query",
    "role": "traveler",
    "data_source": "database"
}
```

### Log Levels
- **DEBUG**: Detailed operations
- **INFO**: Query flow, successful operations
- **WARNING**: Access denials, fallback usage
- **ERROR**: Component failures
- **CRITICAL**: System-wide failures

## 📊 Monitoring Metrics

Access metrics via `/api/ai/stats`:

```python
{
    "uptime_seconds": 3600,
    "total_requests": 150,
    "requests_per_second": 0.042,
    
    "latency": {
        "p50_ms": 234.5,
        "p95_ms": 456.7,
        "p99_ms": 789.0
    },
    
    "intents": {
        "recommendation_query": 80,
        "analytics_query": 30,
        "policy_query": 40
    },
    
    "role_validation": {
        "allowed": 145,
        "denied": 5,
        "denial_rate": 0.033
    },
    
    "llm": {
        "groq_success": 140,
        "gemini_fallback": 8,
        "fallback_rate": 0.054
    }
}
```

## 🎓 Best Practices

### 1. Intent Classification
- Use keyword patterns for common queries (95% hit rate)
- Embedding fallback for ambiguous queries
- Log low confidence classifications

### 2. Database Queries
- Always use indexed fields (user_id, partner_id, created_at)
- Limit results with pagination
- Cache aggregations where possible
- Use time range filters to avoid full scans

### 3. RAG Operations
- Keep similarity threshold high (≥ 0.75)
- Refuse to answer when no relevant context
- Always cite sources
- Use semantic chunking (500-800 tokens)

### 4. LLM Usage
- Use LLM only for formatting, not data generation
- Set low temperature (0.3) for deterministic formatting
- Implement timeouts to prevent hanging
- Log all fallback events

### 5. Security
- Validate user_id from authentication token
- Never trust user-supplied role claims
- Enforce resource ownership checks
- Log all access denials

## 🐛 Troubleshooting

### Intent Misclassification
```python
# Debug intent classification
intent = await classifier.classify(query)
print(f"Intent: {intent.intent}, Confidence: {intent.confidence}")
print(f"Method: {intent.method}")

# If confidence < 0.6, query is ambiguous
# Add more keyword patterns or improve embeddings
```

### Access Denied Errors
```python
# Check role permissions
result = await validator.validate(user_id, role, intent)
if not result.allowed:
    print(f"Denied: {result.reason}")
    
# Verify resource ownership
# partner_id in request must match user_id (for partners)
```

### LLM Fallback Issues
```python
# Check LLM provider stats
stats = llm.get_stats()
print(f"Fallback rate: {stats['fallback_rate']}")
print(f"Total failures: {stats['total_failures']}")

# High fallback rate? Check Groq API key and quota
# Both failing? Check network connectivity
```

### RAG Returns No Results
```python
# Check ChromaDB collection
results = collection.query(query_texts=[query], n_results=5)
print(f"Found {len(results['documents'][0])} chunks")

# No results? Need to index documents first
# Low similarity? Adjust threshold or improve chunking
```

## 🚀 Production Deployment Checklist

- [ ] Enable Firebase Authentication validation
- [ ] Implement rate limiting (60 req/min per user)
- [ ] Add input validation and sanitization
- [ ] Set up logging aggregation (CloudWatch/Datadog)
- [ ] Configure monitoring alerts
- [ ] Implement caching for common queries
- [ ] Set up backup LLM provider
- [ ] Add comprehensive error handling
- [ ] Implement request tracing
- [ ] Set up load balancing
- [ ] Configure auto-scaling
- [ ] Add health checks for all dependencies
- [ ] Implement circuit breakers
- [ ] Set up metrics dashboards
- [ ] Configure backup and disaster recovery

## 📚 Additional Resources

- [LangChain Documentation](https://python.langchain.com/)
- [Groq API Docs](https://console.groq.com/docs)
- [Gemini API Docs](https://ai.google.dev/docs)
- [ChromaDB Documentation](https://docs.trychroma.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

## 🤝 Contributing

When extending this system:

1. **Add new intents**: Update `Intent` enum and keyword patterns
2. **Add new roles**: Update `UserRole` and permission mappings
3. **Add new data sources**: Create new engine and update router
4. **Add monitoring**: Log all new events and metrics

## 📄 License

SkyConnect SL - Hybrid AI System
Copyright © 2026

---

**Built with ❤️ for production-grade AI systems**
