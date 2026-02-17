"""
Example: Integrating Repository Pattern with Travel Assistant
Shows how to use the new real-time data fetcher in your chatbot
"""

import sys
import os
import asyncio
from datetime import datetime, timedelta

# Add backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

try:
    from config.firebase_admin import init_db
    from data import FirestoreRepository, CachedRepository, SearchFilters
    from services.ai.llm_provider import get_llm_provider
except ImportError as e:
    print(f"\n❌ Import Error: {e}")
    print("\nPlease run this script from the backend directory:")
    print("  cd backend")
    print("  python data/example_usage.py")
    print("\nOr run with proper Python path:")
    print("  PYTHONPATH=. python data/example_usage.py")
    sys.exit(1)


async def example_real_time_queries():
    """
    Demonstrate real-time data fetching with the repository pattern
    """
    
    # Step 1: Initialize repository
    try:
        firestore_db = init_db()
        base_repo = FirestoreRepository(firestore_db)
    except Exception as e:
        print(f"\n❌ Failed to initialize Firestore: {e}")
        print("\nMake sure:")
        print("1. Firebase credentials are configured")
        print("2. serviceAccountKey.json exists in backend/config/")
        print("3. Firestore database is created in Firebase Console")
        return
    
    # Step 2: Wrap with caching layer
    data_repo = CachedRepository(base_repo)
    
    print("\n" + "="*60)
    print("EXAMPLE: Real-Time Data Fetching for Chatbot")
    print("="*60)
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Example 1: Search for listings (cached)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    print("\n📍 Example 1: Search for beach hotels in Galle")
    print("-" * 60)
    
    filters = SearchFilters(
        location="Galle",
        category="Accommodation",
        max_price=200,
        available_only=True
    )
    
    listings = await data_repo.get_listings(filters, limit=5)
    print(f"✓ Found {len(listings)} listings")
    
    for listing in listings[:3]:
        print(f"  • {listing.title} - ${listing.price}/night - {listing.location}")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Example 2: Check real-time availability (NO cache)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    print("\n📅 Example 2: Check real-time availability")
    print("-" * 60)
    
    if listings:
        listing = listings[0]
        start_date = datetime.now() + timedelta(days=7)
        end_date = start_date + timedelta(days=3)
        
        availability = await data_repo.check_availability(
            listing.id,
            start_date,
            end_date
        )
        
        print(f"Checking: {listing.title}")
        print(f"Dates: {start_date.date()} to {end_date.date()}")
        print(f"Available: {'✅ YES' if availability.available else '❌ NO'}")
        
        if not availability.available:
            print(f"Reason: {availability.reason}")
            print(f"Conflicts: {len(availability.conflicting_bookings)} booking(s)")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Example 3: Get user preferences (cached)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    print("\n👤 Example 3: Get user preferences")
    print("-" * 60)
    
    # Replace with actual user ID
    user_id = "test_user_123"
    
    prefs = await data_repo.get_user_preferences(user_id)
    
    if prefs:
        print(f"User interests: {', '.join(prefs.interests)}")
        print(f"Preferred locations: {', '.join(prefs.preferred_locations)}")
        print(f"Budget: ${prefs.budget_min} - ${prefs.budget_max}")
    else:
        print("No preferences found (normal for new users)")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Example 4: Get current price (real-time, no cache)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    print("\n💰 Example 4: Get current price (real-time)")
    print("-" * 60)
    
    if listings:
        listing = listings[0]
        price = await data_repo.get_listing_price(listing.id)
        print(f"{listing.title}: ${price}/night")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Example 5: Cache statistics
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    print("\n📊 Example 5: Cache statistics")
    print("-" * 60)
    
    stats = data_repo._get_cache_stats()
    print(f"Cache hits: {stats['hits']}")
    print(f"Cache misses: {stats['misses']}")
    print(f"Hit rate: {stats['hit_rate']}")
    print(f"Listing cache size: {stats['listing_cache_size']}")
    
    print("\n" + "="*60)


async def example_chatbot_integration():
    """
    Example: Using repository in chatbot service
    """
    
    print("\n" + "="*60)
    print("EXAMPLE: Chatbot Integration with Repository")
    print("="*60)
    
    # Initialize
    firestore_db = init_db()
    data_repo = CachedRepository(FirestoreRepository(firestore_db))
    llm_provider = get_llm_provider()
    
    # Simulate user query
    user_query = "Find me a beach hotel in Galle under $150"
    user_id = "user_123"
    
    print(f"\n💬 User Query: {user_query}")
    print("-" * 60)
    
    # Step 1: Parse query into filters
    filters = SearchFilters(
        location="Galle",
        category="Accommodation",
        max_price=150,
        tags=["beach"],
        available_only=True
    )
    
    # Step 2: Fetch real-time data
    print("🔍 Fetching listings from database...")
    listings = await data_repo.get_listings(filters, limit=5)
    print(f"✓ Found {len(listings)} matching listings")
    
    # Step 3: Get user preferences for ranking
    print("👤 Fetching user preferences...")
    user_prefs = await data_repo.get_user_preferences(user_id)
    
    # Step 4: Build prompt with REAL data
    if listings:
        listing_summaries = []
        for i, listing in enumerate(listings[:3], 1):
            listing_summaries.append(
                f"{i}. {listing.title} - ${listing.price}/night\n"
                f"   Location: {listing.location}\n"
                f"   Rating: {listing.rating}⭐ ({listing.review_count} reviews)"
            )
        
        retrieved_data = "\n\n".join(listing_summaries)
        
        prompt = f"""You are a travel assistant. Answer based ONLY on the retrieved data below.

USER QUERY: {user_query}

RETRIEVED LISTINGS:
{retrieved_data}

INSTRUCTIONS:
- Recommend the top 2-3 options
- Mention specific prices and ratings
- Keep response under 100 words
- Cite listing names

RESPONSE:"""
        
        print("\n🤖 Generating LLM response...")
        response = await llm_provider.generate_response(prompt)
        
        print("\n📤 Chatbot Response:")
        print("-" * 60)
        print(response if response else "⚠️ LLM not available")
        
        print("\n✅ Response is grounded in real-time database data!")
    
    else:
        print("\n❌ No listings found matching criteria")
        print("⚠️ Chatbot should tell user to broaden search")
    
    print("\n" + "="*60)


async def example_availability_workflow():
    """
    Example: Complete booking availability check workflow
    """
    
    print("\n" + "="*60)
    print("EXAMPLE: Booking Availability Workflow")
    print("="*60)
    
    # Initialize
    firestore_db = init_db()
    data_repo = CachedRepository(FirestoreRepository(firestore_db))
    
    # Scenario: User wants to book a hotel
    user_query = "Is the Galle Beach Hotel available March 15-18?"
    
    print(f"\n💬 User Query: {user_query}")
    print("-" * 60)
    
    # Step 1: Search for the hotel
    print("🔍 Step 1: Finding the hotel...")
    filters = SearchFilters(location="Galle")
    listings = await data_repo.get_listings(filters, limit=10)
    
    # Find matching listing
    target_listing = None
    for listing in listings:
        if "beach" in listing.title.lower() and "galle" in listing.location.lower():
            target_listing = listing
            break
    
    if not target_listing and listings:
        target_listing = listings[0]  # Use first result for demo
    
    if not target_listing:
        print("❌ Hotel not found")
        return
    
    print(f"✓ Found: {target_listing.title}")
    
    # Step 2: Check availability (REAL-TIME)
    print("\n📅 Step 2: Checking real-time availability...")
    
    start_date = datetime(2026, 3, 15)
    end_date = datetime(2026, 3, 18)
    
    availability = await data_repo.check_availability(
        target_listing.id,
        start_date,
        end_date
    )
    
    # Step 3: Get current price (REAL-TIME)
    print("\n💰 Step 3: Checking current price...")
    current_price = await data_repo.get_listing_price(target_listing.id)
    
    # Step 4: Generate response
    print("\n🤖 Step 4: Generating response...")
    
    if availability.available:
        nights = (end_date - start_date).days
        total_price = current_price * nights if current_price else 0
        
        response = f"""✅ Great news! {target_listing.title} is available for your dates.

📅 Check-in: {start_date.strftime('%B %d, %Y')}
📅 Check-out: {end_date.strftime('%B %d, %Y')}
🌙 Nights: {nights}
💰 Price: ${current_price}/night
💵 Total: ${total_price}

Would you like to proceed with the booking?"""
    
    else:
        response = f"""❌ Unfortunately, {target_listing.title} is not available for those dates.

Reason: {availability.reason}

Would you like to:
1. Try different dates
2. See similar hotels in Galle"""
    
    print("\n📤 Chatbot Response:")
    print("-" * 60)
    print(response)
    
    print("\n✅ All data was fetched in REAL-TIME from database!")
    print("="*60)


if __name__ == "__main__":
    print("\n" + "━"*60)
    print("  REPOSITORY PATTERN DEMONSTRATION")
    print("  Real-Time Data Fetching for AI Chatbot")
    print("━"*60)
    
    # Run examples
    asyncio.run(example_real_time_queries())
    asyncio.run(example_chatbot_integration())
    asyncio.run(example_availability_workflow())
    
    print("\n✅ All examples completed!")
    print("\nKEY TAKEAWAYS:")
    print("1. ✅ Real-time availability checks (no caching)")
    print("2. ✅ Real-time price queries (no caching)")
    print("3. ✅ Smart caching for listings (2 min TTL)")
    print("4. ✅ Smart caching for user prefs (5 min TTL)")
    print("5. ✅ LLM responses grounded in database facts")
    print("6. ✅ Clean separation: Data layer ← Business logic ← LLM")
    print("\n" + "━"*60)
