"""
Caching Repository Wrapper
Adds intelligent caching layer over any repository implementation
"""

import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from cachetools import TTLCache

from .repository import DataRepository
from .models import (
    Listing, UserPreferences, Booking, AvailabilityCheck, SearchFilters
)

logger = logging.getLogger(__name__)


class CachedRepository(DataRepository):
    """
    Caching wrapper for any repository
    
    Features:
    - TTL-based caching for safe data (preferences, listings)
    - NO caching for critical real-time data (availability, price)
    - Cache invalidation support
    - Cache hit/miss metrics
    
    Cache policies:
    - User preferences: 5 minutes (rarely change)
    - Listing details: 2 minutes (safe for browsing)
    - Availability: NEVER (must be real-time)
    - Price: NEVER (must be real-time)
    """
    
    def __init__(self, base_repository: DataRepository):
        """
        Wrap an existing repository with caching
        
        Args:
            base_repository: Underlying repository (e.g., FirestoreRepository)
        """
        self.base = base_repository
        
        # Separate caches with different TTLs
        self.listing_cache = TTLCache(maxsize=1000, ttl=120)  # 2 min
        self.user_prefs_cache = TTLCache(maxsize=500, ttl=300)  # 5 min
        self.search_cache = TTLCache(maxsize=200, ttl=60)  # 1 min
        
        # Metrics
        self.cache_hits = 0
        self.cache_misses = 0
        
        logger.info("✓ CachedRepository initialized (wrapping base repository)")
    
    def _get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics for monitoring"""
        total = self.cache_hits + self.cache_misses
        hit_rate = self.cache_hits / total if total > 0 else 0
        
        return {
            'hits': self.cache_hits,
            'misses': self.cache_misses,
            'total_requests': total,
            'hit_rate': f"{hit_rate:.2%}",
            'listing_cache_size': len(self.listing_cache),
            'prefs_cache_size': len(self.user_prefs_cache),
            'search_cache_size': len(self.search_cache),
        }
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Listing Operations (CACHED)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    async def get_listing(self, listing_id: str) -> Optional[Listing]:
        """Get listing (cached for 2 minutes)"""
        cache_key = f"listing:{listing_id}"
        
        if cache_key in self.listing_cache:
            self.cache_hits += 1
            logger.debug(f"Cache HIT: {cache_key}")
            return self.listing_cache[cache_key]
        
        self.cache_misses += 1
        logger.debug(f"Cache MISS: {cache_key}")
        
        # Fetch from base repository
        listing = await self.base.get_listing(listing_id)
        
        if listing:
            self.listing_cache[cache_key] = listing
        
        return listing
    
    async def get_listings(
        self, 
        filters: SearchFilters,
        limit: int = 10,
        offset: int = 0
    ) -> List[Listing]:
        """Get listings (cached for 1 minute)"""
        # Create cache key from filters
        cache_key = f"listings:{hash((str(filters.to_dict()), limit, offset))}"
        
        if cache_key in self.search_cache:
            self.cache_hits += 1
            logger.debug(f"Cache HIT: listings search")
            return self.search_cache[cache_key]
        
        self.cache_misses += 1
        logger.debug(f"Cache MISS: listings search")
        
        # Fetch from base
        listings = await self.base.get_listings(filters, limit, offset)
        
        if listings:
            self.search_cache[cache_key] = listings
        
        return listings
    
    async def search_listings_semantic(
        self,
        query: str,
        limit: int = 10
    ) -> List[Listing]:
        """Semantic search (cached for 1 minute)"""
        cache_key = f"semantic:{query}:{limit}"
        
        if cache_key in self.search_cache:
            self.cache_hits += 1
            return self.search_cache[cache_key]
        
        self.cache_misses += 1
        results = await self.base.search_listings_semantic(query, limit)
        
        if results:
            self.search_cache[cache_key] = results
        
        return results
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Availability Operations (NO CACHING - ALWAYS REAL-TIME)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    async def check_availability(
        self,
        listing_id: str,
        start_date: datetime,
        end_date: datetime
    ) -> AvailabilityCheck:
        """
        Check availability (NO CACHING - always real-time)
        
        This is critical - we never cache availability checks
        because bookings can happen any second
        """
        logger.debug(f"⚡ Real-time availability check for {listing_id}")
        return await self.base.check_availability(listing_id, start_date, end_date)
    
    async def get_listing_price(
        self,
        listing_id: str,
        date: Optional[datetime] = None
    ) -> Optional[float]:
        """
        Get price (NO CACHING - always real-time)
        
        Prices may change dynamically, so always fetch fresh
        """
        logger.debug(f"⚡ Real-time price check for {listing_id}")
        return await self.base.get_listing_price(listing_id, date)
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # User Preferences (CACHED - 5 minutes)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    async def get_user_preferences(self, user_id: str) -> Optional[UserPreferences]:
        """Get user preferences (cached for 5 minutes)"""
        cache_key = f"prefs:{user_id}"
        
        if cache_key in self.user_prefs_cache:
            self.cache_hits += 1
            logger.debug(f"Cache HIT: user preferences")
            return self.user_prefs_cache[cache_key]
        
        self.cache_misses += 1
        prefs = await self.base.get_user_preferences(user_id)
        
        if prefs:
            self.user_prefs_cache[cache_key] = prefs
        
        return prefs
    
    async def get_user_saved_listings(self, user_id: str) -> List[str]:
        """Get saved listings (pass through - small data)"""
        return await self.base.get_user_saved_listings(user_id)
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Booking Operations (NO CACHING)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    async def get_bookings_for_listing(
        self,
        listing_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        status_filter: Optional[List[str]] = None
    ) -> List[Booking]:
        """Get bookings (no caching - always fresh)"""
        return await self.base.get_bookings_for_listing(
            listing_id, start_date, end_date, status_filter
        )
    
    async def get_user_bookings(
        self,
        user_id: str,
        status_filter: Optional[List[str]] = None
    ) -> List[Booking]:
        """Get user bookings (no caching)"""
        return await self.base.get_user_bookings(user_id, status_filter)
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Batch Operations (DELEGATE)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    async def get_listings_batch(self, listing_ids: List[str]) -> List[Listing]:
        """Batch fetch (opportunistic caching)"""
        results = []
        missing_ids = []
        
        # Check cache first
        for listing_id in listing_ids:
            cache_key = f"listing:{listing_id}"
            if cache_key in self.listing_cache:
                self.cache_hits += 1
                results.append(self.listing_cache[cache_key])
            else:
                missing_ids.append(listing_id)
        
        # Fetch missing from base
        if missing_ids:
            self.cache_misses += len(missing_ids)
            fetched = await self.base.get_listings_batch(missing_ids)
            
            # Cache results
            for listing in fetched:
                cache_key = f"listing:{listing.id}"
                self.listing_cache[cache_key] = listing
                results.append(listing)
        
        return results
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Aggregations (DELEGATE)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    async def get_listing_stats(self, listing_id: str) -> Dict[str, Any]:
        """Get stats (no caching - may change frequently)"""
        return await self.base.get_listing_stats(listing_id)
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Cache Management
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    def invalidate_listing(self, listing_id: str):
        """Manually invalidate a listing from cache"""
        cache_key = f"listing:{listing_id}"
        if cache_key in self.listing_cache:
            del self.listing_cache[cache_key]
            logger.info(f"Invalidated cache for listing {listing_id}")
    
    def invalidate_user_preferences(self, user_id: str):
        """Manually invalidate user preferences"""
        cache_key = f"prefs:{user_id}"
        if cache_key in self.user_prefs_cache:
            del self.user_prefs_cache[cache_key]
            logger.info(f"Invalidated cache for user {user_id}")
    
    def clear_all_caches(self):
        """Clear all caches"""
        self.listing_cache.clear()
        self.user_prefs_cache.clear()
        self.search_cache.clear()
        logger.info("✓ All caches cleared")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Health Check
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    async def health_check(self) -> bool:
        """Check base repository health"""
        return await self.base.health_check()
