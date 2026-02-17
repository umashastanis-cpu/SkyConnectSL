"""
Repository Pattern for Real-Time Data Fetching
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARCHITECTURE OVERVIEW
=====================

This implementation provides a clean, type-safe, testable data access layer
for your AI chatbot with intelligent caching and real-time guarantees.

┌─────────────────────────────────────────────────────────────┐
│                   TravelAssistantService                    │ ← Business Logic
│                   (Chatbot orchestration)                   │
└────────────────────────┬────────────────────────────────────┘
                         │ uses
                         ▼
           ┌─────────────────────────────┐
           │   DataRepository (ABC)      │ ← Interface (contracts)
           └─────────────────────────────┘
                         │
           ┌─────────────┴─────────────┐
           │                           │
           ▼                           ▼
┌──────────────────────┐    ┌──────────────────────┐
│ FirestoreRepository  │    │  CachedRepository    │ ← Implementations
│ (Real-time queries)  │    │  (Caching wrapper)   │
└──────────────────────┘    └──────────────────────┘


COMPONENTS
==========

1. models.py - Data Models
   ├─ Listing           (accommodation, tours, etc.)
   ├─ UserPreferences   (interests, budget, etc.)
   ├─ Booking           (reservation data)
   ├─ AvailabilityCheck (availability status)
   └─ SearchFilters     (query parameters)

2. repository.py - Abstract Interface
   └─ Defines contracts for all data operations
   └─ Enables mocking for tests
   └─ Allows swapping backends (Firestore → Postgres)

3. firestore_repository.py - Real-Time Implementation
   ├─ Direct Firestore queries (indexed)
   ├─ NO caching at this level
   ├─ Real-time availability checks
   ├─ Real-time price queries
   └─ Batch operations for efficiency

4. cached_repository.py - Caching Wrapper
   ├─ Wraps any repository with intelligent caching
   ├─ Different TTLs for different data types
   ├─ NEVER caches critical data (availability, price)
   ├─ Cache hit/miss metrics
   └─ Manual invalidation support


CACHING POLICY
==============

Data Type           | TTL     | Rationale
--------------------|---------|------------------------------------------
Listing details     | 2 min   | Safe for browsing, rarely change
User preferences    | 5 min   | Rarely change, not critical
Search results      | 1 min   | Balance freshness and performance
Availability        | NEVER   | Must be real-time (bookings happen)
Price               | NEVER   | Must be real-time (dynamic pricing)
Bookings            | NEVER   | Must be real-time (status changes)


USAGE EXAMPLES
==============

Example 1: Basic Setup
----------------------

from config.firebase_admin import init_db
from data import FirestoreRepository, CachedRepository

# Initialize
firestore_db = init_db()
base_repo = FirestoreRepository(firestore_db)
data_repo = CachedRepository(base_repo)  # Add caching layer


Example 2: Search Listings
---------------------------

from data import SearchFilters

# Build filters
filters = SearchFilters(
    location="Galle",
    category="Accommodation",
    max_price=150,
    amenities=["pool", "wifi"],
    available_only=True
)

# Fetch listings (cached for 1 minute)
listings = await data_repo.get_listings(filters, limit=10)

for listing in listings:
    print(f"{listing.title} - ${listing.price}/night")


Example 3: Real-Time Availability Check
----------------------------------------

from datetime import datetime, timedelta

# User wants to book
listing_id = "hotel_123"
start_date = datetime(2026, 3, 15)
end_date = datetime(2026, 3, 18)

# Check availability (NEVER cached - always real-time)
availability = await data_repo.check_availability(
    listing_id,
    start_date,
    end_date
)

if availability.available:
    print("✅ Available!")
else:
    print(f"❌ Not available: {availability.reason}")
    print(f"Conflicts: {availability.conflicting_bookings}")


Example 4: Get User Preferences
---------------------------------

# Get preferences (cached for 5 minutes)
prefs = await data_repo.get_user_preferences(user_id)

if prefs:
    print(f"Interests: {prefs.interests}")
    print(f"Budget: ${prefs.budget_min} - ${prefs.budget_max}")


Example 5: Chatbot Integration
-------------------------------

# In travel_assistant_service.py

class TravelAssistantService:
    def __init__(self, data_repo: DataRepository, llm_provider: LLMProvider):
        self.data = data_repo  # ← Injected dependency
        self.llm = llm_provider
    
    async def handle_query(self, query: str, user_id: str):
        # 1. Parse query into filters
        filters = self._parse_query(query)
        
        # 2. Fetch real-time data
        listings = await self.data.get_listings(filters)
        
        # 3. Get user preferences for ranking
        prefs = await self.data.get_user_preferences(user_id)
        
        # 4. Rank results
        ranked = self._rank_by_preferences(listings, prefs)
        
        # 5. Build prompt with REAL data
        prompt = self._build_prompt(query, ranked)
        
        # 6. Generate LLM response (grounded in facts)
        response = await self.llm.generate_response(prompt)
        
        return {
            "message": response,
            "listings": [l.to_dict() for l in ranked[:3]],
            "source": "real_time_database"
        }


INTEGRATION WITH EXISTING CODE
===============================

Step 1: Update travel_assistant_service.py
-------------------------------------------

# OLD (tightly coupled to firestore_service)
from services.firestore_service import firestore_service

class TravelAssistantService:
    async def generate_response(self, query, user_id):
        listings = await firestore_service.get_all_listings()
        ...

# NEW (uses repository pattern)
from data import DataRepository, SearchFilters

class TravelAssistantService:
    def __init__(self, data_repo: DataRepository):
        self.data = data_repo  # ← Injected
    
    async def generate_response(self, query, user_id):
        filters = SearchFilters(available_only=True)
        listings = await self.data.get_listings(filters)
        ...


Step 2: Update main.py or API endpoints
----------------------------------------

from config.firebase_admin import init_db
from data import FirestoreRepository, CachedRepository
from services.ai.travel_assistant_service import TravelAssistantService
from services.ai.llm_provider import get_llm_provider

# Initialize data layer
firestore_db = init_db()
data_repo = CachedRepository(FirestoreRepository(firestore_db))

# Initialize service with repository
llm_provider = get_llm_provider()
travel_service = TravelAssistantService(
    data_repo=data_repo,
    llm_provider=llm_provider
)

# Use in API endpoint
@app.post("/api/chat")
async def chat(request: ChatRequest):
    response = await travel_service.generate_response(
        query=request.message,
        user_id=request.user_id
    )
    return response


TESTING BENEFITS
================

Before (Hard to Test):
----------------------

def test_chatbot():
    # Must setup real Firestore
    # Must populate test data in Firestore
    # Slow, brittle, expensive
    ...

After (Easy to Test):
---------------------

from data import DataRepository
from data.models import Listing

class MockRepository(DataRepository):
    async def get_listings(self, filters, limit=10):
        return [
            Listing(id="1", title="Test Hotel", price=100, ...),
            Listing(id="2", title="Test Resort", price=200, ...)
        ]

def test_chatbot():
    # Use mock repository
    mock_repo = MockRepository()
    service = TravelAssistantService(data_repo=mock_repo)
    
    # Test business logic without database
    result = await service.generate_response("find hotels")
    
    assert len(result['listings']) == 2
    assert result['listings'][0]['title'] == "Test Hotel"


PERFORMANCE BENEFITS
====================

Scenario: User searches for "beach hotels in Galle"

WITHOUT Repository Pattern:
----------------------------
1. Fetch ALL listings from Firestore       → 500ms
2. Filter in Python (location, category)   → 200ms
3. Score in Python                          → 100ms
4. Format with LLM                          → 300ms
Total: ~1100ms

WITH Repository Pattern:
------------------------
1. Firestore indexed query (pre-filtered)  → 50ms  ✅ 10x faster
2. Cache hit (second query)                → 5ms   ✅ 100x faster
3. Score in Python                         → 100ms
4. Format with LLM                         → 300ms
Total: ~455ms (first query), ~405ms (cached)


MONITORING & DEBUGGING
======================

Cache Statistics:
-----------------

stats = data_repo._get_cache_stats()
print(f"Hit rate: {stats['hit_rate']}")
print(f"Cache size: {stats['listing_cache_size']}")

Health Check:
-------------

is_healthy = await data_repo.health_check()
if not is_healthy:
    logger.error("Database connection failed!")

Cache Invalidation:
-------------------

# When listing is updated via admin
data_repo.invalidate_listing(listing_id)

# When user updates preferences
data_repo.invalidate_user_preferences(user_id)


BEST PRACTICES
==============

1. ✅ Always use filters to minimize data transfer
2. ✅ Never cache availability or pricing
3. ✅ Invalidate cache when data is updated
4. ✅ Monitor cache hit rate (target: >60%)
5. ✅ Use batch operations for multiple listings
6. ✅ Handle None returns gracefully
7. ✅ Log performance metrics
8. ✅ Use type hints for IDE support


MIGRATION CHECKLIST
===================

□ Install dependencies (cachetools already in requirements.txt)
□ Create backend/data/ directory structure
□ Copy data layer files (models, repository, etc.)
□ Update travel_assistant_service to use repository
□ Update API endpoints to inject repository
□ Run example_usage.py to verify setup
□ Write tests with mock repository
□ Monitor cache hit rate in production
□ Gradually replace direct firestore_service calls


FAQ
===

Q: Should I cache everything?
A: NO. Only cache data that doesn't change frequently. NEVER cache
   availability, price, or booking status.

Q: What if Firestore query is slow?
A: Add composite indexes in firestore.indexes.json. Monitor with
   Firestore metrics dashboard.

Q: Can I use with other databases?
A: YES. Just implement DataRepository for your database:
   - PostgresRepository
   - MongoRepository
   - ElasticsearchRepository

Q: How do I test without mocking?
A: Use FirestoreRepository with emulator or test database.

Q: How do I add new fields?
A: Update models.py, then update from_dict/to_dict methods.


NEXT STEPS
==========

1. Run example_usage.py to see it in action
2. Update travel_assistant_service.py to use repository
3. Add monitoring to track cache performance
4. Write tests for your business logic
5. Add more repository methods as needed


For questions or issues, check:
- example_usage.py for working examples
- repository.py for full API documentation
- firestore_repository.py for implementation details
"""

# Print this documentation
if __name__ == "__main__":
    print(__doc__)
