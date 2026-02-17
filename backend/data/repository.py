"""
Abstract Data Repository Interface
Defines contract for all data access implementations
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from datetime import datetime

from .models import Listing, UserPreferences, Booking, AvailabilityCheck, SearchFilters


class DataRepository(ABC):
    """
    Abstract repository for all data operations
    
    This interface ensures:
    - Consistent API across different backends (Firestore, Postgres, etc.)
    - Easy mocking for tests
    - Clean separation from business logic
    - Type safety with data models
    """
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Listing Operations (READ)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    @abstractmethod
    async def get_listing(self, listing_id: str) -> Optional[Listing]:
        """
        Get a single listing by ID (real-time)
        
        Args:
            listing_id: Unique listing identifier
            
        Returns:
            Listing object or None if not found
        """
        pass
    
    @abstractmethod
    async def get_listings(
        self, 
        filters: SearchFilters,
        limit: int = 10,
        offset: int = 0
    ) -> List[Listing]:
        """
        Get listings with filters (real-time)
        
        Args:
            filters: Search filters (location, price, amenities, etc.)
            limit: Maximum number of results
            offset: Pagination offset
            
        Returns:
            List of matching listings
        """
        pass
    
    @abstractmethod
    async def search_listings_semantic(
        self,
        query: str,
        limit: int = 10
    ) -> List[Listing]:
        """
        Semantic search for listings (uses vector DB if available)
        
        Args:
            query: Natural language search query
            limit: Maximum number of results
            
        Returns:
            List of semantically relevant listings
        """
        pass
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Availability Operations (REAL-TIME CRITICAL)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    @abstractmethod
    async def check_availability(
        self,
        listing_id: str,
        start_date: datetime,
        end_date: datetime
    ) -> AvailabilityCheck:
        """
        Check real-time availability for a listing
        
        This is CRITICAL - must query database every time (no caching)
        
        Args:
            listing_id: Listing to check
            start_date: Check-in date
            end_date: Check-out date
            
        Returns:
            AvailabilityCheck with status and conflicts
        """
        pass
    
    @abstractmethod
    async def get_listing_price(
        self,
        listing_id: str,
        date: Optional[datetime] = None
    ) -> Optional[float]:
        """
        Get current price for a listing (real-time)
        
        May vary by season/demand in future
        
        Args:
            listing_id: Listing ID
            date: Optional date for dynamic pricing
            
        Returns:
            Current price or None
        """
        pass
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # User Preferences (CACHEABLE)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    @abstractmethod
    async def get_user_preferences(self, user_id: str) -> Optional[UserPreferences]:
        """
        Get user's preferences for recommendations
        
        Safe to cache (preferences don't change frequently)
        
        Args:
            user_id: User identifier
            
        Returns:
            UserPreferences object or None
        """
        pass
    
    @abstractmethod
    async def get_user_saved_listings(self, user_id: str) -> List[str]:
        """
        Get IDs of user's saved/bookmarked listings
        
        Args:
            user_id: User identifier
            
        Returns:
            List of listing IDs
        """
        pass
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Booking Operations (REAL-TIME CRITICAL)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    @abstractmethod
    async def get_bookings_for_listing(
        self,
        listing_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        status_filter: Optional[List[str]] = None
    ) -> List[Booking]:
        """
        Get bookings for a listing (for availability checking)
        
        Args:
            listing_id: Listing ID
            start_date: Filter by start date
            end_date: Filter by end date
            status_filter: Filter by booking status (e.g., ['confirmed', 'pending'])
            
        Returns:
            List of bookings
        """
        pass
    
    @abstractmethod
    async def get_user_bookings(
        self,
        user_id: str,
        status_filter: Optional[List[str]] = None
    ) -> List[Booking]:
        """
        Get user's bookings
        
        Args:
            user_id: User ID
            status_filter: Filter by status
            
        Returns:
            List of user's bookings
        """
        pass
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Batch Operations (PERFORMANCE OPTIMIZATION)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    @abstractmethod
    async def get_listings_batch(self, listing_ids: List[str]) -> List[Listing]:
        """
        Batch fetch multiple listings (efficient)
        
        Args:
            listing_ids: List of listing IDs
            
        Returns:
            List of listings (may be fewer if some not found)
        """
        pass
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Aggregations (ANALYTICS)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    @abstractmethod
    async def get_listing_stats(self, listing_id: str) -> Dict[str, Any]:
        """
        Get statistics for a listing
        
        Args:
            listing_id: Listing ID
            
        Returns:
            Statistics dict (views, bookings, revenue, etc.)
        """
        pass
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Utilities
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    async def health_check(self) -> bool:
        """
        Check if repository is healthy and reachable
        
        Returns:
            True if healthy, False otherwise
        """
        return True
