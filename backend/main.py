"""
FastAPI Main Application
Entry point for the SkyConnect AI Backend

⚠️  PRODUCTION READINESS DISCLAIMER ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is a DEMONSTRATION/MVP version. NOT production-ready.

Missing critical production requirements:
- ❌ Authentication & Authorization (all endpoints are PUBLIC!)
- ❌ Rate Limiting (vulnerable to abuse)
- ❌ Input Validation & Sanitization (security risk)
- ❌ Comprehensive Testing (0% test coverage)
- ❌ Monitoring & Logging (no observability)
- ❌ Error Handling (implementation details exposed)
- ❌ RBAC (no role-based access control)

See BACKEND_QA_ANALYSIS.md for complete audit.

USE ONLY FOR: Development, Testing, Demos, Portfolio
DO NOT USE FOR: Production, Real Users, Real Payments

To make production-ready: Implement security measures first!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional, List, Dict, Any
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Import configurations
from config.firebase_admin import initialize_firebase, get_firestore_client
from services.firestore_service import firestore_service

# Import AI services
from services.ai.llm_provider import get_llm_provider
from services.ai.travel_assistant_service import get_travel_assistant
from services.ai.partner_analytics_service import get_analytics_service
from services.ai.admin_moderation_service import get_moderation_service

# Import data layer
from data import FirestoreRepository, CachedRepository

# Import hybrid AI system
from services.ai.hybrid.api_endpoint import router as hybrid_ai_router

# Import authentication middleware
from services.auth_middleware import get_current_user, require_role

# Initialize FastAPI app
app = FastAPI(
    title="SkyConnect AI Backend [DEMO]",
    description="""
    AI-powered travel marketplace backend with LangChain, ChromaDB & Hugging Face
    
    ⚠️  **DEMO VERSION - NOT PRODUCTION READY** ⚠️
    
    This is a proof-of-concept demonstrating AI agent capabilities.
    Missing critical security features (auth, rate limiting, validation).
    
    See `/api/production-status` for details.
    """,
    version="1.0.0-DEMO",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:8081").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(hybrid_ai_router, tags=["Hybrid AI System"])

# Initialize Firebase on startup
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        # Initialize Firebase
        initialize_firebase()
        
        # Initialize real-time data repository
        db = get_firestore_client()
        base_repo = FirestoreRepository(firestore_db=db)
        cached_repo = CachedRepository(base_repository=base_repo)
        
        # Initialize travel assistant with repository
        app.state.data_repository = cached_repo
        get_travel_assistant(data_repository=cached_repo)
        
        print("\n" + "="*60)
        print("🚀 SkyConnect AI Backend [DEMO] - Server Started")
        print("="*60)
        print("✅ Firebase initialized")
        print("✅ Real-time data repository initialized (with caching)")
        print("✅ AI Travel Assistant ready")
        print("="*60)
        print("⚠️  WARNING: This is a DEMO version - NOT production ready!")
        print("   Missing: Auth, Rate Limiting, Validation, Testing")
        print("   See: http://localhost:8000/api/production-status")
        print("="*60 + "\n")
    except Exception as e:
        print(f"❌ Error during startup: {e}")
        raise

# ============================================================
# Health Check & Status Endpoints
# ============================================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "SkyConnect AI Backend",
        "version": "1.0.0-DEMO",
        "warning": "⚠️  DEMO VERSION - Not production ready",
        "documentation": "/docs",
        "production_status": "/api/production-status"
    }

@app.get("/api/production-status")
async def production_status():
    """Get production readiness status"""
    return {
        "production_ready": False,
        "environment": "DEMO/DEVELOPMENT",
        "readiness_score": "35%",
        "critical_missing": [
            "Authentication & Authorization",
            "Rate Limiting",
            "Input Validation & Sanitization",
            "Comprehensive Testing",
            "Structured Logging",
            "Error Handling Strategy",
            "RBAC (Role-Based Access Control)"
        ],
        "security_risks": [
            "All endpoints are public (no auth required)",
            "No rate limiting (vulnerable to DDoS and cost explosion)",
            "No input validation (prompt injection possible)",
            "Admin endpoints accessible to anyone",
            "Error messages may expose implementation details"
        ],
        "safe_for": [
            "Local development",
            "Testing & demos",
            "Portfolio showcase",
            "Learning & experimentation"
        ],
        "not_safe_for": [
            "Production deployment",
            "Real users",
            "Real payments",
            "Public internet access"
        ],
        "next_steps": "See BACKEND_QA_ANALYSIS.md for complete security audit and implementation roadmap",
        "estimated_production_ready": "4-8 weeks with proper security implementation"
    }

# Test Firebase connection
@app.get("/api/test/firebase")
async def test_firebase():
    """Test Firebase Admin SDK connection"""
    try:
        listings = await firestore_service.get_all_listings()
        return {
            "status": "success",
            "message": "Firebase Admin SDK is working",
            "listings_count": len(listings)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# Listing Endpoints
# ============================================================

@app.get("/api/listings")
async def get_listings(
    category: str = None,
    location: str = None,
    min_price: float = None,
    max_price: float = None
):
    """Get all listings with optional filters"""
    try:
        listings = await firestore_service.get_all_listings()
        
        # Apply filters
        if category:
            listings = [l for l in listings if l.get("category") == category]
        if location:
            listings = [l for l in listings if l.get("location") == location]
        if min_price is not None:
            listings = [l for l in listings if l.get("price", 0) >= min_price]
        if max_price is not None:
            listings = [l for l in listings if l.get("price", 0) <= max_price]
        
        return {
            "status": "success",
            "count": len(listings),
            "listings": listings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/listings/{listing_id}")
async def get_listing(listing_id: str):
    """Get a specific listing by ID"""
    try:
        listing = await firestore_service.get_document("listings", listing_id)
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        return {
            "status": "success",
            "listing": listing
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# Partner Endpoints
# ============================================================

@app.get("/api/partners")
async def get_partners():
    """Get all partner profiles"""
    try:
        partners = await firestore_service.get_all_partners()
        return {
            "status": "success",
            "count": len(partners),
            "partners": partners
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/partners/{partner_id}/listings")
async def get_partner_listings(partner_id: str):
    """Get all listings for a specific partner"""
    try:
        listings = await firestore_service.get_partner_listings(partner_id)
        return {
            "status": "success",
            "count": len(listings),
            "listings": listings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# AI Agent Endpoints
# ============================================================

class ChatRequest(BaseModel):
    """Chat request model"""
    message: str
    user_id: str
    conversation_id: Optional[str] = None

class SearchRequest(BaseModel):
    """Semantic search request model"""
    query: str
    limit: int = 5
    filters: Optional[Dict[str, Any]] = None

class RecommendRequest(BaseModel):
    """Recommendation request model"""
    user_id: str
    limit: int = 5
    preferences: Optional[Dict[str, Any]] = None

@app.post("/api/chat")
async def chat_with_agent(request: ChatRequest):
    """
    Chat with the AI Travel Concierge Agent
    
    ⚠️  WARNING: No input validation - vulnerable to prompt injection!
    """
    try:
        from services.ai.agent import TravelConciergeAgent, SimpleFallbackAgent
        
        # Try to initialize the agent
        try:
            agent = TravelConciergeAgent()
            if agent.llm is None:
                # No LLM available, use fallback
                raise Exception("No LLM provider available")
            
            response = await agent.chat(
                message=request.message,
                user_id=request.user_id,
                conversation_id=request.conversation_id
            )
        except Exception as agent_error:
            # Fallback to simple agent if LLM not available
            print(f"⚠️  Using SimpleFallbackAgent: {agent_error}")
            agent = SimpleFallbackAgent()
            response = await agent.chat(
                message=request.message,
                user_id=request.user_id,
                conversation_id=request.conversation_id
            )
        
        return {
            "status": "success",
            "response": response.get("response"),
            "sources": response.get("sources", []),
            "agent_type": response.get("agent_type", "unknown"),
            "llm_provider": response.get("llm_provider", "unknown"),
            "conversation_id": response.get("conversation_id"),
            "warning": "⚠️  Demo version - responses not validated for safety"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@app.post("/api/search/semantic")
async def semantic_search(request: SearchRequest):
    """
    Perform semantic search on listings using vector embeddings
    
    ⚠️  WARNING: No authentication - anyone can search!
    """
    try:
        from services.ai.embeddings import KnowledgeBaseTrainer
        
        trainer = KnowledgeBaseTrainer()
        results = trainer.search(
            query=request.query,
            k=request.limit,
            collection_name="listings"
        )
        
        return {
            "status": "success",
            "query": request.query,
            "count": len(results),
            "results": results,
            "warning": "⚠️  Demo version - no rate limiting applied"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

@app.post("/api/recommend")
async def get_recommendations(request: RecommendRequest):
    """
    Get personalized recommendations for a user
    
    ⚠️  WARNING: No user verification - anyone can access any user's data!
    """
    try:
        from services.ai.embeddings import KnowledgeBaseTrainer
        
        # Get user preferences
        user_profile = await firestore_service.get_traveler_profile(request.user_id)
        
        if not user_profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        # Build query from user preferences
        preferences = request.preferences or user_profile.get("preferences", {})
        query = f"I like {preferences.get('interests', [])} in {preferences.get('preferredDestinations', [])}"
        
        # Search using embeddings
        trainer = KnowledgeBaseTrainer()
        results = trainer.search(
            query=query,
            k=request.limit,
            collection_name="listings"
        )
        
        return {
            "status": "success",
            "user_id": request.user_id,
            "count": len(results),
            "recommendations": results,
            "based_on": preferences,
            "warning": "⚠️  Demo version - recommendations not personalized with real ML"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

@app.post("/api/admin/train")
async def train_knowledge_base():
    """
    Retrain the AI knowledge base with latest data
    
    ⚠️  CRITICAL SECURITY ISSUE: Admin endpoint is PUBLIC!
    Anyone can trigger expensive embedding operations!
    """
    try:
        from services.ai.embeddings import KnowledgeBaseTrainer
        
        trainer = KnowledgeBaseTrainer()
        
        # Train on latest data
        listings_count = await trainer.train_listings()
        partners_count = await trainer.train_partners()
        guide_count = await trainer.train_travel_guide()
        
        return {
            "status": "success",
            "message": "Knowledge base retrained successfully",
            "counts": {
                "listings": listings_count,
                "partners": partners_count,
                "travel_guide": guide_count
            },
            "warning": "⚠️  SECURITY RISK: This endpoint should require admin authentication!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")

# ============================================================
# NEW: Production-Ready Hybrid AI Endpoints
# ============================================================

class TravelAssistantRequest(BaseModel):
    """Travel assistant chat request"""
    user_id: str
    query: str
    context: Optional[Dict[str, Any]] = None

class PartnerAnalyticsRequest(BaseModel):
    """Partner analytics request"""
    partner_id: str
    period_days: int = 30
    include_llm_summary: bool = True

class ModerationRequest(BaseModel):
    """Moderation request"""
    subject_id: str  # partner_id or listing_id
    subject_type: str  # "partner" or "listing"

@app.post("/api/ai/travel-assistant")
async def travel_assistant_chat(request: TravelAssistantRequest):
    """
    Hybrid AI travel assistant
    
    Architecture:
    1. Deterministic matching (rule-based scoring)
    2. LLM response formatting (Groq → Gemini → fallback)
    
    ⚠️  Demo version - no authentication
    """
    try:
        assistant = get_travel_assistant()
        response = await assistant.generate_response(
            user_id=request.user_id,
            query=request.query,
            context=request.context
        )
        
        return {
            "status": "success",
            **response
        }
    except Exception as e:
        logger.error(f"Travel assistant error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ai/match-listings/{user_id}")
async def match_listings_for_user(user_id: str, limit: int = 3):
    """
    Get matched listings for a user (pure deterministic)
    
    Uses rule-based scoring - NO LLM required
    """
    try:
        assistant = get_travel_assistant()
        matches = await assistant.match_listings(user_id=user_id, limit=limit)
        
        return {
            "status": "success",
            "user_id": user_id,
            "count": len(matches),
            "matches": matches
        }
    except Exception as e:
        logger.error(f"Matching error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/partner-analytics")
async def get_partner_analytics_report(request: PartnerAnalyticsRequest):
    """
    Partner analytics report
    
    Architecture:
    1. Deterministic aggregation (100% accurate)
    2. Optional LLM summary (conversational formatting)
    
    ⚠️  Demo version - no authentication
    """
    try:
        analytics_service = get_analytics_service()
        report = await analytics_service.get_partner_analytics(
            partner_id=request.partner_id,
            period_days=request.period_days,
            include_llm_summary=request.include_llm_summary
        )
        
        return {
            "status": "success",
            **report
        }
    except Exception as e:
        logger.error(f"Analytics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/moderate")
async def moderate_content(request: ModerationRequest):
    """
    Content moderation
    
    Pure rule-based logic - NO LLM
    
    Features:
    - Duplicate detection
    - Profile completeness scoring
    - Auto-approve/reject decisions
    
    ⚠️  CRITICAL: Admin endpoint is PUBLIC!
    """
    try:
        moderation_service = get_moderation_service()
        
        if request.subject_type == "partner":
            result = await moderation_service.moderate_partner_application(
                partner_id=request.subject_id
            )
        elif request.subject_type == "listing":
            result = await moderation_service.moderate_listing(
                listing_id=request.subject_id
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="subject_type must be 'partner' or 'listing'"
            )
        
        return {
            "status": "success",
            **result
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Moderation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ai/llm-status")
async def get_llm_status():
    """
    Get LLM provider status
    
    Shows which providers are available and ready
    """
    try:
        llm_provider = get_llm_provider()
        status = llm_provider.get_status()
        
        return {
            "status": "success",
            "llm_status": status,
            "architecture": {
                "primary": "Groq (LLaMA 3.3 70B)",
                "fallback": "Google Gemini 1.5 Flash",
                "final_fallback": "Deterministic responses"
            }
        }
    except Exception as e:
        logger.error(f"LLM status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# Run Server
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
