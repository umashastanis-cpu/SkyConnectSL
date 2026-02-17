"""
Firestore Repository Implementation
Real-time data fetcher for Firestore backend
"""

import logging
from typing import List, Optional, Dict, Any
from datetime import datetime

from .repository import DataRepository
from .models import (
    Listing, UserPreferences, Booking, AvailabilityCheck, 
    SearchFilters, BookingStatus
)

logger = logging.getLogger(__name__)


class FirestoreRepository(DataRepository):
    """
    Real-time Firestore data repository
    
    Features:
    - Direct Firestore queries (no caching at this level)
    - Indexed queries for performance
    - Type-safe data models
    - Error handling with fallbacks
    """
    
    def __init__(self, firestore_db):
        """
        Initialize repository with Firestore database
        
        Args:
            firestore_db: Firestore database instance
        """
        self.db = firestore_db
        logger.info("✓ FirestoreRepository initialized")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Listing Operations
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    async def get_listing(self, listing_id: str) -> Optional[Listing]:
        """Get single listing by ID (real-time)"""
        try:
            doc = self.db.collection('listings').document(listing_id).get()
            
            if not doc.exists:
                logger.warning(f"Listing {listing_id} not found")
                return None
            
            data = doc.to_dict()
            data['id'] = doc.id
            return Listing.from_dict(data)
            
        except Exception as e:
            logger.error(f"Error fetching listing {listing_id}: {e}")
            return None
    
    async def get_listings(
        self, 
        filters: SearchFilters,
        limit: int = 10,
        offset: int = 0
    ) -> List[Listing]:
        """
        Get listings with filters (real-time)
        
        Uses Firestore composite indexes for efficient querying
        """
        try:
            # Start with base query
            query = self.db.collection('listings')
            
            # Filter by status (always approved for public)
            if filters.available_only:
                query = query.where('status', '==', 'approved')
                query = query.where('available', '==', True)
            
            # Location filter (exact match)
            if filters.location:
                query = query.where('location', '==', filters.location)
            
            # Category filter
            if filters.category:
                query = query.where('category', '==', filters.category)
            
            # Price range (NOTE: Firestore limitation - can only use one inequality)
            if filters.max_price is not None:
                query = query.where('price', '<=', filters.max_price)
            
            # Rating filter
            if filters.min_rating is not None:
                query = query.where('rating', '>=', filters.min_rating)
            
            # Amenities filter (array-contains for single amenity)
            # For multiple amenities, we fetch and filter in Python
            if filters.amenities and len(filters.amenities) == 1:
                query = query.where('amenities', 'array_contains', filters.amenities[0])
            
            # Pagination
            if offset > 0:
                query = query.offset(offset)
            
            # Execute query
            docs = query.limit(limit).stream()
            
            listings = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                listing = Listing.from_dict(data)
                
                # Post-filter for conditions Firestore can't handle
                if not self._matches_filters(listing, filters):
                    continue
                
                listings.append(listing)
            
            logger.info(f"✓ Fetched {len(listings)} listings with filters: {filters.to_dict()}")
            return listings
            
        except Exception as e:
            logger.error(f"Error fetching listings: {e}")
            return []
    
    def _matches_filters(self, listing: Listing, filters: SearchFilters) -> bool:
        """Post-query filtering for complex conditions"""
        
        # Min price (if max_price was used in query, can't use min_price there)
        if filters.min_price is not None and listing.price < filters.min_price:
            return False
        
        # Multiple amenities (all must be present)
        if filters.amenities and len(filters.amenities) > 1:
            if not all(amenity in listing.amenities for amenity in filters.amenities):
                return False
        
        # Tags filter
        if filters.tags:
            if not any(tag in listing.tags for tag in filters.tags):
                return False
        
        # Capacity filter
        if filters.min_capacity is not None and listing.capacity < filters.min_capacity:
            return False
        
        return True
    
    async def search_listings_semantic(
        self,
        query: str,
        limit: int = 10
    ) -> List[Listing]:
        """
        Semantic search (placeholder - integrate with vector DB later)
        
        For now, falls back to text matching on title/description
        """
        try:
            # Simple text search (Firestore doesn't have full-text search)
            # In production, use Algolia or vector DB
            
            all_docs = self.db.collection('listings')\
                .where('status', '==', 'approved')\
                .where('available', '==', True)\
                .limit(50)\
                .stream()
            
            listings = []
            query_lower = query.lower()
            
            for doc in all_docs:
                data = doc.to_dict()
                data['id'] = doc.id
                
                # Simple keyword matching
                title = data.get('title', '').lower()
                description = data.get('description', '').lower()
                location = data.get('location', '').lower()
                
                if query_lower in title or query_lower in description or query_lower in location:
                    listings.append(Listing.from_dict(data))
            
            logger.info(f"✓ Semantic search for '{query}' found {len(listings)} results")
            return listings[:limit]
            
        except Exception as e:
            logger.error(f"Error in semantic search: {e}")
            return []
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Availability Operations (REAL-TIME CRITICAL)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    async def check_availability(
        self,
        listing_id: str,
        start_date: datetime,
        end_date: datetime
    ) -> AvailabilityCheck:
        """
        Check real-time availability (NO CACHING)
        
        Algorithm:
        1. Check if listing exists and is active
        2. Query all confirmed/pending bookings for listing
        3. Check for date overlap
        """
        try:
            # Check listing exists
            listing = await self.get_listing(listing_id)
            if not listing:
                return AvailabilityCheck(
                    listing_id=listing_id,
                    available=False,
                    start_date=start_date,
                    end_date=end_date,
                    reason="Listing not found"
                )
            
            if not listing.available:
                return AvailabilityCheck(
                    listing_id=listing_id,
                    available=False,
                    start_date=start_date,
                    end_date=end_date,
                    reason="Listing is inactive"
                )
            
            # Get conflicting bookings
            bookings = await self.get_bookings_for_listing(
                listing_id=listing_id,
                status_filter=[BookingStatus.CONFIRMED.value, BookingStatus.PENDING.value]
            )
            
            conflicts = []
            for booking in bookings:
                # Check for date overlap
                # Overlap if: NOT (end_date < booking_start OR start_date > booking_end)
                if not (end_date <= booking.start_date or start_date >= booking.end_date):
                    conflicts.append(booking.id)
            
            available = len(conflicts) == 0
            
            return AvailabilityCheck(
                listing_id=listing_id,
                available=available,
                start_date=start_date,
                end_date=end_date,
                conflicting_bookings=conflicts,
                reason=None if available else f"Conflicts with {len(conflicts)} booking(s)"
            )
            
        except Exception as e:
            logger.error(f"Error checking availability: {e}")
            return AvailabilityCheck(
                listing_id=listing_id,
                available=False,
                start_date=start_date,
                end_date=end_date,
                reason=f"Error: {str(e)}"
            )
    
    async def get_listing_price(
        self,
        listing_id: str,
        date: Optional[datetime] = None
    ) -> Optional[float]:
        """Get current price (real-time)"""
        try:
            listing = await self.get_listing(listing_id)
            return listing.price if listing else None
        except Exception as e:
            logger.error(f"Error fetching price: {e}")
            return None
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # User Preferences
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    async def get_user_preferences(self, user_id: str) -> Optional[UserPreferences]:
        """Get user preferences from traveler profile"""
        try:
            doc = self.db.collection('travelers').document(user_id).get()
            
            if not doc.exists:
                logger.warning(f"User {user_id} not found")
                return None
            
            data = doc.to_dict()
            return UserPreferences.from_dict(data, user_id)
            
        except Exception as e:
            logger.error(f"Error fetching user preferences: {e}")
            return None
    
    async def get_user_saved_listings(self, user_id: str) -> List[str]:
        """Get user's saved listing IDs"""
        try:
            # Check if there's a saved_listings subcollection
            saved_ref = self.db.collection('travelers').document(user_id)\
                .collection('saved_listings')
            
            docs = saved_ref.stream()
            return [doc.id for doc in docs]
            
        except Exception as e:
            logger.error(f"Error fetching saved listings: {e}")
            return []
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Booking Operations
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    async def get_bookings_for_listing(
        self,
        listing_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        status_filter: Optional[List[str]] = None
    ) -> List[Booking]:
        """Get bookings for a listing"""
        try:
            query = self.db.collection('bookings')\
                .where('listing_id', '==', listing_id)
            
            if status_filter:
                query = query.where('status', 'in', status_filter)
            
            docs = query.stream()
            
            bookings = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                booking = Booking.from_dict(data)
                
                # Filter by date if provided
                if start_date and booking.end_date < start_date:
                    continue
                if end_date and booking.start_date > end_date:
                    continue
                
                bookings.append(booking)
            
            return bookings
            
        except Exception as e:
            logger.error(f"Error fetching bookings for listing: {e}")
            return []
    
    async def get_user_bookings(
        self,
        user_id: str,
        status_filter: Optional[List[str]] = None
    ) -> List[Booking]:
        """Get user's bookings"""
        try:
            query = self.db.collection('bookings')\
                .where('user_id', '==', user_id)
            
            if status_filter:
                query = query.where('status', 'in', status_filter)
            
            docs = query.stream()
            
            bookings = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                bookings.append(Booking.from_dict(data))
            
            return bookings
            
        except Exception as e:
            logger.error(f"Error fetching user bookings: {e}")
            return []
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Batch Operations
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    async def get_listings_batch(self, listing_ids: List[str]) -> List[Listing]:
        """Batch fetch listings (efficient)"""
        try:
            if not listing_ids:
                return []
            
            # Firestore batch get
            listings = []
            for listing_id in listing_ids:
                listing = await self.get_listing(listing_id)
                if listing:
                    listings.append(listing)
            
            return listings
            
        except Exception as e:
            logger.error(f"Error batch fetching listings: {e}")
            return []
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Aggregations
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    async def get_listing_stats(self, listing_id: str) -> Dict[str, Any]:
        """Get listing statistics"""
        try:
            # Get listing
            listing = await self.get_listing(listing_id)
            if not listing:
                return {}
            
            # Get bookings count
            bookings = await self.get_bookings_for_listing(listing_id)
            
            total_bookings = len(bookings)
            confirmed_bookings = len([b for b in bookings if b.status == BookingStatus.CONFIRMED.value])
            total_revenue = sum(b.total_price for b in bookings if b.status == BookingStatus.CONFIRMED.value)
            
            return {
                'listing_id': listing_id,
                'total_bookings': total_bookings,
                'confirmed_bookings': confirmed_bookings,
                'total_revenue': total_revenue,
                'rating': listing.rating,
                'review_count': listing.review_count,
            }
            
        except Exception as e:
            logger.error(f"Error fetching listing stats: {e}")
            return {}
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Health Check
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    async def health_check(self) -> bool:
        """Check Firestore connection"""
        try:
            # Try a simple query
            self.db.collection('listings').limit(1).get()
            return True
        except Exception as e:
            logger.error(f"Firestore health check failed: {e}")
            return False
