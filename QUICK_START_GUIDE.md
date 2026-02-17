# 🚀 Quick Start Guide - SkyConnect SL Hybrid AI System

Complete setup guide to run the production-grade hybrid AI backend with Firebase integration.

---

## 📋 Prerequisites

- **Python**: 3.11 or higher
- **Node.js**: 18+ (for mobile app)
- **Firebase Project**: skyconnectsl-13e92 (already configured)
- **API Keys**: Groq and Gemini API keys

---

## ⚙️ Backend Setup (5 minutes)

### Step 1: Install Python Dependencies

```powershell
cd backend
pip install -r requirements.txt
```

**This will install:**
- FastAPI framework
- Firebase Admin SDK
- ChromaDB (vector database)
- LangChain + Groq integration
- Google Generative AI (Gemini)
- sentence-transformers (semantic search)
- All supporting libraries

**Expected output:** ~30 packages installed successfully

---

### Step 2: Configure Environment Variables

1. **Copy the example environment file:**
   ```powershell
   cp .env.example .env
   ```

2. **Edit `.env` and add your API keys:**
   ```bash
   # LLM Provider API Keys
   GROQ_API_KEY=gsk_your_groq_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Firebase Configuration
   FIREBASE_PROJECT_ID=skyconnectsl-13e92
   
   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19006
   
   # Environment
   ENVIRONMENT=development
   ```

3. **Get your API keys:**
   - **Groq API Key**: https://console.groq.com/keys
   - **Gemini API Key**: https://aistudio.google.com/app/apikey

---

### Step 3: Download Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **skyconnectsl-13e92**
3. Navigate: **Project Settings** → **Service Accounts** → **Generate New Private Key**
4. Save the downloaded file as: `backend/config/serviceAccountKey.json`

**Security Note:** Never commit this file to git (already in .gitignore)

---

### Step 4: Start the Backend Server

```powershell
cd backend
uvicorn main:app --reload --port 8000
```

**Expected output:**
```
🚀 SkyConnect AI Backend [DEMO] - Server Started
============================================================
⚠️  WARNING: This is a DEMO version - NOT production ready!
   Missing: Auth, Rate Limiting, Validation, Testing
   See: http://localhost:8000/api/production-status
============================================================

INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

### Step 5: Test the API

Open your browser and visit:
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/
- **Hybrid AI Examples**: http://localhost:8000/api/ai/examples

---

## 🧪 Testing the Hybrid AI System

### Test 1: Recommendation Query (Database Route)

**Endpoint:** `POST http://localhost:8000/api/ai/query`

```json
{
  "query": "Show me beach resorts in Sri Lanka under $200",
  "user_id": "test_user_123",
  "role": "traveler"
}
```

**Expected Response:**
```json
{
  "intent": "recommendation_query",
  "role_scope": "traveler",
  "data_source": "database",
  "response": "Here are beach resorts matching your criteria...",
  "metadata": {
    "latency_ms": 245.67,
    "intent_confidence": 0.95,
    "classification_method": "keyword",
    "database_query_time_ms": 123.45,
    "llm_format_time_ms": 122.22
  }
}
```

---

### Test 2: Policy Query (RAG Route)

**Endpoint:** `POST http://localhost:8000/api/ai/query`

```json
{
  "query": "What is your cancellation policy?",
  "user_id": "test_user_123",
  "role": "traveler"
}
```

**Expected Response:**
```json
{
  "intent": "policy_query",
  "role_scope": "traveler",
  "data_source": "knowledge_base",
  "response": "Our cancellation policy allows...",
  "metadata": {
    "latency_ms": 567.89,
    "intent_confidence": 0.92,
    "classification_method": "keyword",
    "rag_query_time_ms": 234.56,
    "llm_synthesis_time_ms": 333.33,
    "sources": ["policies/cancellation.md"],
    "similarity_score": 0.87
  }
}
```

---

### Test 3: Partner Analytics (Database Route - RBAC Protected)

**Endpoint:** `POST http://localhost:8000/api/ai/query`

```json
{
  "query": "Show my analytics for this month",
  "user_id": "partner_123",
  "role": "partner",
  "partner_id": "partner_123"
}
```

**Expected Response:**
```json
{
  "intent": "analytics_query",
  "role_scope": "partner:partner_123",
  "data_source": "database",
  "response": "Your analytics for this month show...",
  "metadata": {
    "latency_ms": 189.45,
    "intent_confidence": 0.98,
    "classification_method": "keyword"
  }
}
```

---

### Test 4: Check System Health

**Endpoint:** `GET http://localhost:8000/api/ai/health`

**Expected Response:**
```json
{
  "status": "healthy",
  "services": {
    "intent_classifier": "operational",
    "role_validator": "operational",
    "query_router": "operational",
    "data_engine": "operational",
    "rag_engine": "operational",
    "llm_provider": "operational",
    "monitoring": "operational"
  },
  "llm_status": {
    "groq": "available",
    "gemini": "available"
  }
}
```

---

### Test 5: View System Statistics

**Endpoint:** `GET http://localhost:8000/api/ai/stats`

**Expected Response:**
```json
{
  "total_queries": 42,
  "intent_distribution": {
    "recommendation_query": 18,
    "policy_query": 12,
    "analytics_query": 8,
    "navigation_query": 4
  },
  "role_distribution": {
    "traveler": 30,
    "partner": 10,
    "admin": 2
  },
  "routing_distribution": {
    "database": 26,
    "knowledge_base": 14,
    "hybrid": 2
  },
  "performance": {
    "average_latency_ms": 345.67,
    "p50_latency_ms": 289.12,
    "p95_latency_ms": 678.45,
    "p99_latency_ms": 892.34
  },
  "llm_provider_stats": {
    "total_requests": 42,
    "groq_requests": 40,
    "gemini_requests": 2,
    "fallback_rate": 0.048
  }
}
```

---

## 📱 Mobile App Integration

### Step 1: Create API Service Layer

Create `src/services/api/hybridAI.ts`:

```typescript
import { auth } from '@/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000' 
  : 'https://your-production-url.com';

interface QueryRequest {
  query: string;
  user_id: string;
  role: 'traveler' | 'partner' | 'admin';
  partner_id?: string;
}

interface QueryResponse {
  intent: string;
  role_scope: string;
  data_source: string;
  response: string;
  metadata: {
    latency_ms: number;
    intent_confidence: number;
    classification_method: string;
  };
}

export const hybridAIService = {
  async queryAI(query: string, role: 'traveler' | 'partner' | 'admin'): Promise<QueryResponse> {
    try {
      // Get Firebase ID token
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const token = await user.getIdToken();
      
      // Get partner ID if applicable
      const partnerId = role === 'partner' 
        ? await AsyncStorage.getItem('partnerId') 
        : undefined;
      
      const response = await fetch(`${API_BASE_URL}/api/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query,
          user_id: user.uid,
          role,
          partner_id: partnerId,
        } as QueryRequest),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Query failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Hybrid AI query failed:', error);
      throw error;
    }
  },
  
  async getRecommendations(preferences: string): Promise<QueryResponse> {
    return this.queryAI(
      `Find listings matching: ${preferences}`,
      'traveler'
    );
  },
  
  async getPartnerAnalytics(timeRange: string = 'this month'): Promise<QueryResponse> {
    return this.queryAI(
      `Show my analytics for ${timeRange}`,
      'partner'
    );
  },
  
  async getPolicyInfo(topic: string): Promise<QueryResponse> {
    return this.queryAI(
      `Explain the ${topic} policy`,
      'traveler'
    );
  },
};
```

---

### Step 2: Create React Hook

Create `src/hooks/useHybridAI.ts`:

```typescript
import { useState } from 'react';
import { hybridAIService } from '@/services/api/hybridAI';

export const useHybridAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);
  
  const query = async (
    query: string, 
    role: 'traveler' | 'partner' | 'admin'
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await hybridAIService.queryAI(query, role);
      setLastResponse(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Query failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    query,
    loading,
    error,
    lastResponse,
  };
};
```

---

### Step 3: Use in Your Screen

```typescript
import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { useHybridAI } from '@/hooks/useHybridAI';
import { useAuth } from '@/contexts/AuthContext';

export const AIAssistantScreen = () => {
  const [queryText, setQueryText] = useState('');
  const { query, loading, error, lastResponse } = useHybridAI();
  const { userRole } = useAuth(); // 'traveler' | 'partner' | 'admin'
  
  const handleQuery = async () => {
    try {
      await query(queryText, userRole);
    } catch (err) {
      console.error('Query failed:', err);
    }
  };
  
  return (
    <View style={{ padding: 20 }}>
      <TextInput
        value={queryText}
        onChangeText={setQueryText}
        placeholder="Ask anything..."
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      
      <Button 
        title={loading ? "Thinking..." : "Ask AI"} 
        onPress={handleQuery}
        disabled={loading || !queryText}
      />
      
      {error && (
        <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text>
      )}
      
      {lastResponse && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold' }}>
            Intent: {lastResponse.intent}
          </Text>
          <Text style={{ fontWeight: 'bold' }}>
            Source: {lastResponse.data_source}
          </Text>
          <Text style={{ marginTop: 10 }}>
            {lastResponse.response}
          </Text>
          <Text style={{ fontSize: 12, color: 'gray', marginTop: 5 }}>
            Responded in {lastResponse.metadata.latency_ms.toFixed(0)}ms
          </Text>
        </View>
      )}
    </View>
  );
};
```

---

## 🔒 Adding Authentication to Endpoints

### Update Backend Endpoints with Auth Middleware

Edit `backend/services/ai/hybrid/api_endpoint.py`:

```python
from services.auth_middleware import get_current_user, require_role

@router.post(
    "/query",
    response_model=QueryResponse,
    summary="Process AI Query",
)
async def query_endpoint(
    request: QueryRequest,
    current_user: dict = Depends(get_current_user),  # Add authentication
):
    """Process query with Firebase authentication"""
    try:
        # Use authenticated user's ID and role
        user_id = current_user['uid']
        role = UserRole(request.role)
        
        # Verify role matches user's actual role in Firebase
        actual_role = current_user.get('role', 'traveler')
        if actual_role != request.role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role mismatch: expected {actual_role}, got {request.role}"
            )
        
        # For partner queries, verify partner_id matches user
        if role == UserRole.PARTNER:
            user_partner_id = current_user.get('partner_id')
            if request.partner_id != user_partner_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Cannot access other partner's data"
                )
        
        # Process query with validated user
        result = await hybrid_system.process_query(
            query=request.query,
            user_id=user_id,
            role=role,
            partner_id=request.partner_id
        )
        
        return QueryResponse(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        logger.error(f"Query processing error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

---

## 🚀 Production Deployment Checklist

### Before Deploying to Production:

- [ ] **Environment Variables:**
  - [ ] GROQ_API_KEY configured
  - [ ] GEMINI_API_KEY configured
  - [ ] FIREBASE_PROJECT_ID configured
  - [ ] ALLOWED_ORIGINS updated for production domain
  - [ ] ENVIRONMENT=production

- [ ] **Firebase:**
  - [ ] Service account key uploaded securely
  - [ ] Firestore security rules deployed
  - [ ] Firebase Authentication enabled
  - [ ] Custom claims configured for roles

- [ ] **Authentication:**
  - [ ] All endpoints use `Depends(get_current_user)`
  - [ ] Role validation enabled
  - [ ] Partner ID verification for partner endpoints
  - [ ] Email verification enforced

- [ ] **Security:**
  - [ ] CORS configured with specific origins (no wildcards)
  - [ ] Rate limiting implemented
  - [ ] Input validation enabled
  - [ ] API keys in environment variables (not code)
  - [ ] serviceAccountKey.json in .gitignore

- [ ] **Monitoring:**
  - [ ] Structured logging enabled
  - [ ] Error tracking configured
  - [ ] Performance metrics collected
  - [ ] Alerts set up for failures

- [ ] **Testing:**
  - [ ] Run test suite: `python backend/services/ai/hybrid/test_examples.py`
  - [ ] Test authentication flow
  - [ ] Test role-based access control
  - [ ] Load test API endpoints
  - [ ] Test LLM fallback mechanism

---

## 📊 Architecture Overview

```
Mobile App (React Native)
    ↓ Firebase ID Token
Backend API (FastAPI)
    ↓ Token Verification
Authentication Middleware
    ↓ Authenticated User
Hybrid AI System
    ├─ Intent Classifier (keyword → embedding)
    ├─ Role Validator (RBAC)
    ├─ Query Router
    │   ├─ Database Engine (analytics, revenue, listings)
    │   └─ RAG Engine (policies, help, explanations)
    └─ LLM Provider (Groq → Gemini fallback)
    ↓
Firebase Firestore / ChromaDB
```

---

## 🆘 Troubleshooting

### Issue: Import error for sentence-transformers

**Solution:**
```powershell
pip install sentence-transformers==2.2.2
```

The system uses lazy imports and will gracefully degrade to keyword-only classification if not installed.

---

### Issue: Firebase Admin SDK authentication failed

**Solutions:**
1. Verify `serviceAccountKey.json` exists at `backend/config/serviceAccountKey.json`
2. Check file permissions (should be readable)
3. Verify FIREBASE_PROJECT_ID matches your Firebase project
4. Ensure Firebase Admin SDK is initialized in `config/firebase_admin.py`

---

### Issue: Groq API rate limit exceeded

**Solution:**
The system automatically falls back to Gemini. Check statistics:
```bash
GET http://localhost:8000/api/ai/stats
```

Look for `fallback_rate` - if consistently high, consider:
- Upgrading Groq API tier
- Implementing request queuing
- Caching common queries

---

### Issue: CORS errors in mobile app

**Solution:**
Update `backend/.env`:
```bash
# Allow your Expo dev server
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19006,exp://192.168.1.100:8081
```

For production:
```bash
ALLOWED_ORIGINS=https://your-app-domain.com
```

---

### Issue: ChromaDB persistence errors

**Solution:**
Ensure ChromaDB data directory exists:
```powershell
mkdir backend/chroma_data
```

The directory is created automatically, but check permissions if errors occur.

---

## 📚 Next Steps

1. **Index Knowledge Base:**
   ```python
   from services.ai.hybrid.rag_engine import get_rag_engine
   
   rag_engine = get_rag_engine()
   rag_engine.index_policy_document(
       "Our cancellation policy allows...",
       {"type": "policy", "category": "cancellation"}
   )
   ```

2. **Implement Firestore Queries:**
   Update `backend/services/ai/hybrid/data_engine.py` with real Firestore queries

3. **Add Rate Limiting:**
   Use [slowapi](https://github.com/laurentS/slowapi) for rate limiting

4. **Deploy to Production:**
   Follow [INTEGRATION_ARCHITECTURE_GUIDE.md](INTEGRATION_ARCHITECTURE_GUIDE.md) deployment section

---

## 📖 Additional Resources

- **Complete Integration Guide:** [INTEGRATION_ARCHITECTURE_GUIDE.md](INTEGRATION_ARCHITECTURE_GUIDE.md)
- **Hybrid AI Documentation:** [backend/services/ai/hybrid/README.md](backend/services/ai/hybrid/README.md)
- **API Examples:** http://localhost:8000/api/ai/examples
- **API Documentation:** http://localhost:8000/docs

---

## 🎯 Quick Test Commands

### Test from command line (PowerShell):

```powershell
# Test recommendation query
curl -X POST "http://localhost:8000/api/ai/query" `
  -H "Content-Type: application/json" `
  -d '{\"query\":\"Show beach resorts\",\"user_id\":\"test123\",\"role\":\"traveler\"}'

# Test health check
curl http://localhost:8000/api/ai/health

# View statistics
curl http://localhost:8000/api/ai/stats

# View example queries
curl http://localhost:8000/api/ai/examples
```

---

**Status:** ✅ System operational and ready for testing
**Version:** 1.0.0
**Last Updated:** 2024
