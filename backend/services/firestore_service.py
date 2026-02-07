"""
Firestore Service
Handles all Firestore database operations for the backend
"""

from config.firebase_admin import init_db
from typing import List, Dict, Any, Optional
from datetime import datetime

class FirestoreService:
    """Service for Firestore database operations"""
    
    def __init__(self):
        self.db = init_db()
    
    # Listings Operations
    async def get_all_listings(self, status: str = "approved") -> List[Dict[str, Any]]:
        """
        Get all listings with specified status
        """
        try:
            listings_ref = self.db.collection('listings')
            query = listings_ref.where('status', '==', status)
            docs = query.stream()
            
            listings = []
            for doc in docs:
                listing = doc.to_dict()
                listing['id'] = doc.id
                listings.append(listing)
            
            return listings
        except Exception as e:
            print(f"Error fetching listings: {e}")
            return []
    
    async def get_listing_by_id(self, listing_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a single listing by ID
        """
        try:
            doc_ref = self.db.collection('listings').document(listing_id)
            doc = doc_ref.get()
            
            if doc.exists:
                listing = doc.to_dict()
                listing['id'] = doc.id
                return listing
            return None
        except Exception as e:
            print(f"Error fetching listing {listing_id}: {e}")
            return None
    
    async def search_listings(
        self, 
        category: Optional[str] = None,
        location: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Search listings with filters
        """
        try:
            query = self.db.collection('listings').where('status', '==', 'approved')
            
            if category:
                query = query.where('category', '==', category)
            if location:
                query = query.where('location', '==', location)
            if min_price is not None:
                query = query.where('price', '>=', min_price)
            if max_price is not None:
                query = query.where('price', '<=', max_price)
            
            docs = query.stream()
            
            listings = []
            for doc in docs:
                listing = doc.to_dict()
                listing['id'] = doc.id
                listings.append(listing)
            
            return listings
        except Exception as e:
            print(f"Error searching listings: {e}")
            return []
    
    # User Operations
    async def get_user_profile(self, user_id: str, role: str) -> Optional[Dict[str, Any]]:
        """
        Get user profile (traveler or partner)
        """
        try:
            collection_name = 'travelers' if role == 'traveler' else 'partners'
            doc_ref = self.db.collection(collection_name).document(user_id)
            doc = doc_ref.get()
            
            if doc.exists:
                profile = doc.to_dict()
                profile['id'] = doc.id
                return profile
            return None
        except Exception as e:
            print(f"Error fetching user profile: {e}")
            return None

# Singleton instance
firestore_service = FirestoreService()
