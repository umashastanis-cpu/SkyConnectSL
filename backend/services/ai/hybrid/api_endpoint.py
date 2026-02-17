"""
Hybrid AI Query Endpoint
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FastAPI endpoint for hybrid AI query system

Endpoint: POST /api/ai/query

Request Body:
{
    "query": "Show me beach resorts in Sri Lanka",
    "user_id": "user123",
    "role": "traveler",
    "partner_id": "partner456"  // Optional, for partner-specific queries
}

Response:
{
    "intent": "recommendation_query",
    "role_scope": "traveler",
    "data_source": "database",
    "response": "Here are the top beach resorts...",
    "metadata": {
        "latency_ms": 234.56,
        "intent_confidence": 0.95,
        "classification_method": "keyword"
    }
}

Authentication:
- Production: Requires Firebase Authentication token
- Demo: Uses user_id from request body (WARNING: not secure)

Rate Limiting:
- Production: 60 requests/minute per user
- Demo: No rate limiting (WARNING: vulnerable to abuse)
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel,Field
from typing import Optional, Dict, Any
import logging
import time
import chromadb
from chromadb.config import Settings

from services.ai.hybrid import HybridAISystem, UserRole

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/ai", tags=["AI"])


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Request/Response Models
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class QueryRequest(BaseModel):
    """Request model for AI query"""
    query: str = Field(..., description="Natural language query", min_length=1, max_length=500)
    user_id: str = Field(..., description="Authenticated user ID")
    role: str = Field(..., description="User role (traveler/partner/admin)")
    partner_id: Optional[str] = Field(None, description="Partner ID for partner-specific queries")
    include_raw_data: bool = Field(False, description="Include raw database/RAG results in response")

    class Config:
        schema_extra = {
            "example": {
                "query": "Show me luxury beach resorts in Sri Lanka",
                "user_id": "user123",
                "role": "traveler",
                "include_raw_data": False
            }
        }


class QueryResponse(BaseModel):
    """Response model for AI query"""
    intent: str = Field(..., description="Classified intent")
    role_scope: str = Field(..., description="User role scope")
    data_source: str = Field(..., description="Data source used (database/vector_db/hybrid)")
    response: str = Field(..., description="Natural language response")
    metadata: Dict[str, Any] = Field(..., description="Response metadata")
    raw_data: Optional[Dict] = Field(None, description="Raw data (if requested)")

    class Config:
        schema_extra = {
            "example": {
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
        }


class SystemStatsResponse(BaseModel):
    """Response model for system statistics"""
    llm_provider: Dict[str, Any]
    uptime_seconds: float


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# System Initialization
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Global system instance (initialized on startup)
_hybrid_ai_system: Optional[HybridAISystem] = None
_system_start_time = time.time()


def get_hybrid_ai_system(
    firestore_service,
    chroma_client
) -> HybridAISystem:
    """Get or create hybrid AI system instance"""
    global _hybrid_ai_system
    if _hybrid_ai_system is None:
        _hybrid_ai_system = HybridAISystem(
            firestore_service=firestore_service,
            chroma_client=chroma_client
        )
    return _hybrid_ai_system


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Endpoints
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post(
    "/query",
    response_model=QueryResponse,
    summary="Process AI Query",
    description="""
    Process a natural language query through the hybrid AI system.
    
    The system will:
    1. Classify the query intent (recommendation, analytics, policy, etc.)
    2. Validate role-based access permissions
    3. Route to appropriate engine (database or RAG)
    4. Format response with optional LLM enhancement
    5. Return structured JSON response with metadata
    
    **Supported Intents:**
    - `recommendation_query`: Find hotels/experiences
    - `saved_items_query`: View bookmarked items
    - `analytics_query`: View performance metrics (partner/admin)
    - `revenue_query`: View revenue data (partner/admin)
    - `moderation_query`: Review content (admin only)
    - `policy_query`: Explain policies/terms
    - `navigation_query`: How-to questions
    - `troubleshooting_query`: Fix issues
    
    **Roles:**
    - `traveler`: Personal recommendations and saved items
    - `partner`: Own analytics and revenue
    - `admin`: System-wide access
    """,
    responses={
        200: {"description": "Query processed successfully"},
        400: {"description": "Invalid request"},
        403: {"description": "Access denied (role permission)"},
        500: {"description": "Server error"}
    }
)
async def query_endpoint(
    request: QueryRequest,
    # TODO: Add Firebase authentication dependency
    # current_user: dict = Depends(get_current_user)
):
    """
    Main AI query endpoint
    
    ⚠️  DEMO VERSION - Missing authentication!
    Production requires Firebase token validation.
    """
    
    # TODO: Validate user_id from Firebase token
    # if current_user["uid"] != request.user_id:
    #     raise HTTPException(status_code=403, detail="User ID mismatch")
    
    # Validate role
    try:
        UserRole(request.role)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role: {request.role}. Must be traveler/partner/admin"
        )
    
    # Get dependencies (in production, these come from DI container)
    from config.firebase_admin import db as firestore_service
    
    # Initialize ChromaDB client (using PersistentClient for new API)
    chroma_client = chromadb.PersistentClient(path="./chroma_data")
    
    # Get AI system
    ai_system = get_hybrid_ai_system(firestore_service, chroma_client)
    
    # Process query
    try:
        response = await ai_system.query(
            query=request.query,
            user_id=request.user_id,
            role=request.role,
            partner_id=request.partner_id,
            include_raw_data=request.include_raw_data
        )
        
        return response.to_dict()
    
    except HTTPException:
        raise
    
    except Exception as e:
        logger.error(f"Error processing query: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error processing query"
        )


@router.get(
    "/stats",
    response_model=SystemStatsResponse,
    summary="Get System Statistics",
    description="Get AI system usage statistics including LLM provider metrics"
)
async def stats_endpoint():
    """Get hybrid AI system statistics"""
    
    if _hybrid_ai_system is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI system not initialized"
        )
    
    stats = _hybrid_ai_system.get_stats()
    uptime = time.time() - _system_start_time
    
    return {
        "llm_provider": stats["llm_provider"],
        "uptime_seconds": round(uptime, 2)
    }


@router.get(
    "/health",
    summary="Health Check",
    description="Check if hybrid AI system is operational"
)
async def health_endpoint():
    """Health check endpoint"""
    
    if _hybrid_ai_system is None:
        return {
            "status": "initializing",
            "healthy": False,
            "message": "AI system not yet initialized"
        }
    
    return {
        "status": "healthy",
        "healthy": True,
        "uptime_seconds": round(time.time() - _system_start_time, 2)
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Example Queries (for testing)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXAMPLE_QUERIES = {
    "traveler_recommendation": {
        "query": "Show me luxury beach resorts in Sri Lanka",
        "user_id": "traveler_001",
        "role": "traveler"
    },
    "traveler_saved_items": {
        "query": "What have I bookmarked?",
        "user_id": "traveler_001",
        "role": "traveler"
    },
    "partner_analytics": {
        "query": "How many views did my listings get this week?",
        "user_id": "partner_001",
        "role": "partner",
        "partner_id": "partner_001"
    },
    "partner_revenue": {
        "query": "What's my total earnings this month?",
        "user_id": "partner_001",
        "role": "partner",
        "partner_id": "partner_001"
    },
    "admin_moderation": {
        "query": "Show pending partner applications",
        "user_id": "admin_001",
        "role": "admin"
    },
    "policy_question": {
        "query": "What's the refund policy for cancellations?",
        "user_id": "traveler_001",
        "role": "traveler"
    },
    "navigation_help": {
        "query": "How do I upload photos to my listing?",
        "user_id": "partner_001",
        "role": "partner"
    },
    "troubleshooting": {
        "query": "Why can't I submit my partner application?",
        "user_id": "partner_002",
        "role": "partner"
    }
}


@router.get(
    "/examples",
    summary="Get Example Queries",
    description="Get example queries for testing different intents and roles"
)
async def examples_endpoint():
    """Return example queries for testing"""
    return {
        "examples": EXAMPLE_QUERIES,
        "instructions": "Use these queries to test different intents and role permissions"
    }
