"""
Data Layer - Repository Pattern Implementation
Provides clean abstraction for real-time data access
"""

from .repository import DataRepository
from .firestore_repository import FirestoreRepository
from .cached_repository import CachedRepository
from .models import Listing, UserPreferences, Booking, AvailabilityCheck, SearchFilters

__all__ = [
    'DataRepository',
    'FirestoreRepository',
    'CachedRepository',
    'Listing',
    'UserPreferences',
    'Booking',
    'AvailabilityCheck',
    'SearchFilters',
]
