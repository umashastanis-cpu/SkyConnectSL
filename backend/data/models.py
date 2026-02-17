"""
Data Models for Repository Pattern
Type-safe data structures for real-time data
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class ListingStatus(Enum):
    """Listing status enumeration"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    INACTIVE = "inactive"


class BookingStatus(Enum):
    """Booking status enumeration"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


@dataclass
class Listing:
    """Listing data model"""
    id: str
    title: str
    description: str
    location: str
    price: float
    category: str
    partner_id: str
    status: str = ListingStatus.PENDING.value
    available: bool = True
    
    # Optional fields
    tags: List[str] = field(default_factory=list)
    amenities: List[str] = field(default_factory=list)
    images: List[str] = field(default_factory=list)
    rating: float = 0.0
    review_count: int = 0
    capacity: int = 1
    
    # Metadata
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    # Scoring (computed)
    match_score: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'price': self.price,
            'category': self.category,
            'partner_id': self.partner_id,
            'status': self.status,
            'available': self.available,
            'tags': self.tags,
            'amenities': self.amenities,
            'images': self.images,
            'rating': self.rating,
            'review_count': self.review_count,
            'capacity': self.capacity,
            'match_score': self.match_score,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Listing':
        """Create from Firestore document"""
        return cls(
            id=data.get('id', ''),
            title=data.get('title', ''),
            description=data.get('description', ''),
            location=data.get('location', ''),
            price=float(data.get('price', 0)),
            category=data.get('category', ''),
            partner_id=data.get('partner_id', ''),
            status=data.get('status', ListingStatus.PENDING.value),
            available=data.get('available', True),
            tags=data.get('tags', []),
            amenities=data.get('amenities', []),
            images=data.get('images', []),
            rating=float(data.get('rating', 0)),
            review_count=int(data.get('review_count', 0)),
            capacity=int(data.get('capacity', 1)),
        )


@dataclass
class UserPreferences:
    """User preferences data model"""
    user_id: str
    interests: List[str] = field(default_factory=list)
    preferred_locations: List[str] = field(default_factory=list)
    budget_min: float = 0.0
    budget_max: float = 10000.0
    preferred_amenities: List[str] = field(default_factory=list)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any], user_id: str) -> 'UserPreferences':
        """Create from Firestore document"""
        return cls(
            user_id=user_id,
            interests=data.get('interests', []),
            preferred_locations=data.get('preferred_locations', []),
            budget_min=float(data.get('budget_min', 0)),
            budget_max=float(data.get('budget_max', 10000)),
            preferred_amenities=data.get('preferred_amenities', []),
        )


@dataclass
class Booking:
    """Booking data model"""
    id: str
    listing_id: str
    user_id: str
    start_date: datetime
    end_date: datetime
    status: str = BookingStatus.PENDING.value
    total_price: float = 0.0
    guests: int = 1
    
    created_at: Optional[datetime] = None
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Booking':
        """Create from Firestore document"""
        return cls(
            id=data.get('id', ''),
            listing_id=data.get('listing_id', ''),
            user_id=data.get('user_id', ''),
            start_date=data.get('start_date'),
            end_date=data.get('end_date'),
            status=data.get('status', BookingStatus.PENDING.value),
            total_price=float(data.get('total_price', 0)),
            guests=int(data.get('guests', 1)),
        )


@dataclass
class AvailabilityCheck:
    """Availability check result"""
    listing_id: str
    available: bool
    start_date: datetime
    end_date: datetime
    conflicting_bookings: List[str] = field(default_factory=list)
    reason: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'listing_id': self.listing_id,
            'available': self.available,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'conflicting_bookings': self.conflicting_bookings,
            'reason': self.reason,
        }


@dataclass
class SearchFilters:
    """Search filters for listings"""
    location: Optional[str] = None
    category: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    amenities: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    available_only: bool = True
    min_rating: Optional[float] = None
    min_capacity: Optional[int] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'location': self.location,
            'category': self.category,
            'min_price': self.min_price,
            'max_price': self.max_price,
            'amenities': self.amenities,
            'tags': self.tags,
            'available_only': self.available_only,
            'min_rating': self.min_rating,
            'min_capacity': self.min_capacity,
        }
