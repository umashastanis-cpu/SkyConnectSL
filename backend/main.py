"""
FastAPI Main Application
Entry point for the SkyConnect AI Backend
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Import configurations
from config.firebase_admin import initialize_firebase
from services.firestore_service import firestore_service

# Initialize FastAPI app
app = FastAPI(
    title="SkyConnect AI Backend",
    description="AI-powered travel marketplace backend with ChromaDB + Hugging Face",
    version="1.0.0"
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

# Initialize Firebase on startup
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        initialize_firebase()
        print("🚀 Backend server started successfully")
    except Exception as e:
        print(f"❌ Error during startup: {e}")
        raise

# Health check endpoint
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "SkyConnect AI Backend",
        "version": "1.0.0"
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

# Get all listings
@app.get("/api/listings")
async def get_listings(
    category: str = None,
    location: str = None,
    min_price: float = None,
    max_price: float = None
):
    """
    Get all approved listings with optional filters
    """
    try:
        if category or location or min_price or max_price:
            listings = await firestore_service.search_listings(
                category=category,
                location=location,
                min_price=min_price,
                max_price=max_price
            )
        else:
            listings = await firestore_service.get_all_listings()
        
        return {
            "status": "success",
            "count": len(listings),
            "listings": listings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get single listing
@app.get("/api/listings/{listing_id}")
async def get_listing(listing_id: str):
    """Get a single listing by ID"""
    try:
        listing = await firestore_service.get_listing_by_id(listing_id)
        if listing:
            return {
                "status": "success",
                "listing": listing
            }
        raise HTTPException(status_code=404, detail="Listing not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# AI endpoints (to be implemented in Phase 3)
@app.post("/api/chat")
async def chat():
    """AI chat endpoint (coming soon)"""
    return {"status": "not_implemented", "message": "AI chat coming in Phase 3"}

@app.post("/api/search")
async def semantic_search():
    """Semantic search endpoint (coming soon)"""
    return {"status": "not_implemented", "message": "Semantic search coming in Phase 3"}

@app.post("/api/recommend")
async def get_recommendations():
    """Recommendations endpoint (coming soon)"""
    return {"status": "not_implemented", "message": "Recommendations coming in Phase 3"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
