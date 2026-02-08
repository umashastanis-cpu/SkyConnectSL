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
    
    async def get_traveler_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get traveler profile by user ID
        """
        return await self.get_user_profile(user_id, 'traveler')
    
    async def get_partner_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get partner profile by user ID
        """
        return await self.get_user_profile(user_id, 'partner')
    
    async def get_all_partners(self, status: str = "approved") -> List[Dict[str, Any]]:
        """
        Get all partners with specified status
        """
        try:
            partners_ref = self.db.collection('partners')
            query = partners_ref.where('status', '==', status)
            docs = query.stream()
            
            partners = []
            for doc in docs:
                partner = doc.to_dict()
                partner['id'] = doc.id
                partners.append(partner)
            
            return partners
        except Exception as e:
            print(f"Error fetching partners: {e}")
            return []
    
    # Booking Operations
    async def get_user_bookings(self, user_id: str, role: str = 'traveler') -> List[Dict[str, Any]]:
        """
        Get all bookings for a user (traveler or partner)
        """
        try:
            bookings_ref = self.db.collection('bookings')
            field_name = 'travelerId' if role == 'traveler' else 'partnerId'
            query = bookings_ref.where(field_name, '==', user_id)
            docs = query.stream()
            
            bookings = []
            for doc in docs:
                booking = doc.to_dict()
                booking['id'] = doc.id
                bookings.append(booking)
            
            return bookings
        except Exception as e:
            print(f"Error fetching bookings: {e}")
            return []
    
    async def get_booking_by_id(self, booking_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a single booking by ID
        """
        try:
            doc_ref = self.db.collection('bookings').document(booking_id)
            doc = doc_ref.get()
            
            if doc.exists:
                booking = doc.to_dict()
                booking['id'] = doc.id
                return booking
            return None
        except Exception as e:
            print(f"Error fetching booking {booking_id}: {e}")
            return None
    
    # Partner-specific Operations
    async def get_partner_listings(self, partner_id: str) -> List[Dict[str, Any]]:
        """
        Get all listings for a specific partner
        """
        try:
            query = self.db.collection('listings').where('partnerId', '==', partner_id)
            docs = query.stream()
            
            listings = []
            for doc in docs:
                listing = doc.to_dict()
                listing['id'] = doc.id
                listings.append(listing)
            
            return listings
        except Exception as e:
            print(f"Error fetching partner listings: {e}")
            return []
    
    # Review Operations
    async def get_reviews(self, listing_id: Optional[str] = None, partner_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get reviews for a listing or partner
        """
        try:
            query = self.db.collection('reviews')
            
            if listing_id:
                query = query.where('listingId', '==', listing_id)
            elif partner_id:
                query = query.where('partnerId', '==', partner_id)
            
            docs = query.stream()
            
            reviews = []
            for doc in docs:
                review = doc.to_dict()
                review['id'] = doc.id
                reviews.append(review)
            
            return reviews
        except Exception as e:
            print(f"Error fetching reviews: {e}")
            return []
    
    # Generic Operations
    async def query_collection(
        self, 
        collection: str, 
        filters: Optional[Dict[str, Any]] = None,
        limit: Optional[int] = None,
        order_by: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Generic query method for any collection
        """
        try:
            query = self.db.collection(collection)
            
            if filters:
                for field, value in filters.items():
                    query = query.where(field, '==', value)
            
            if order_by:
                query = query.order_by(order_by)
            
            if limit:
                query = query.limit(limit)
            
            docs = query.stream()
            
            results = []
            for doc in docs:
                result = doc.to_dict()
                result['id'] = doc.id
                results.append(result)
            
            return results
        except Exception as e:
            print(f"Error querying collection {collection}: {e}")
            return []
    
    async def get_listings_since(self, since_date: datetime) -> List[Dict[str, Any]]:
        """
        Get listings updated since a specific date (for auto-sync)
        """
        try:
            query = self.db.collection('listings').where('updatedAt', '>=', since_date)
            docs = query.stream()
            
            listings = []
            for doc in docs:
                listing = doc.to_dict()
                listing['id'] = doc.id
                listings.append(listing)
            
            return listings
        except Exception as e:
            print(f"Error fetching listings since {since_date}: {e}")
            return []
    
    async def create_document(self, collection: str, data: Dict[str, Any], document_id: Optional[str] = None) -> Optional[str]:
        """
        Create a new document in a collection
        """
        try:
            if document_id:
                doc_ref = self.db.collection(collection).document(document_id)
                doc_ref.set(data)
                return document_id
            else:
                doc_ref = self.db.collection(collection).add(data)
                return doc_ref[1].id
        except Exception as e:
            print(f"Error creating document in {collection}: {e}")
            return None
    
    async def update_document(self, collection: str, document_id: str, data: Dict[str, Any]) -> bool:
        """
        Update an existing document
        """
        try:
            doc_ref = self.db.collection(collection).document(document_id)
            doc_ref.update(data)
            return True
        except Exception as e:
            print(f"Error updating document {document_id} in {collection}: {e}")
            return False
    
    async def delete_document(self, collection: str, document_id: str) -> bool:
        """
        Delete a document from a collection
        """
        try:
            doc_ref = self.db.collection(collection).document(document_id)
            doc_ref.delete()
            return True
        except Exception as e:
            print(f"Error deleting document {document_id} from {collection}: {e}")
            return False

# Singleton instance
firestore_service = FirestoreService()
