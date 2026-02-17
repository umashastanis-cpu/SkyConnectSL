"""
Simple test to verify repository components are installed correctly
Run this first before example_usage.py
"""

import sys
import os

# Add backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

print("="*60)
print("Testing Repository Pattern Installation")
print("="*60)

# Test 1: Import data models
print("\n1. Testing data models import...")
try:
    from data.models import Listing, UserPreferences, SearchFilters
    print("   ✅ Models imported successfully")
except ImportError as e:
    print(f"   ❌ Failed to import models: {e}")
    sys.exit(1)

# Test 2: Import repository interface
print("\n2. Testing repository interface import...")
try:
    from data.repository import DataRepository
    print("   ✅ Repository interface imported successfully")
except ImportError as e:
    print(f"   ❌ Failed to import repository: {e}")
    sys.exit(1)

# Test 3: Import Firestore repository
print("\n3. Testing Firestore repository import...")
try:
    from data.firestore_repository import FirestoreRepository
    print("   ✅ Firestore repository imported successfully")
except ImportError as e:
    print(f"   ❌ Failed to import Firestore repository: {e}")
    sys.exit(1)

# Test 4: Import cached repository
print("\n4. Testing cached repository import...")
try:
    from data.cached_repository import CachedRepository
    print("   ✅ Cached repository imported successfully")
except ImportError as e:
    print(f"   ❌ Failed to import cached repository: {e}")
    sys.exit(1)

# Test 5: Check cachetools dependency
print("\n5. Checking cachetools dependency...")
try:
    from cachetools import TTLCache
    cache = TTLCache(maxsize=10, ttl=60)
    cache['test'] = 'value'
    assert cache['test'] == 'value'
    print("   ✅ cachetools working correctly")
except ImportError:
    print("   ❌ cachetools not installed")
    print("   Run: pip install cachetools")
    sys.exit(1)

# Test 6: Create a test model
print("\n6. Testing model creation...")
try:
    test_listing = Listing(
        id="test_123",
        title="Test Hotel",
        description="A test hotel",
        location="Galle",
        price=100.0,
        category="Accommodation",
        partner_id="partner_123"
    )
    assert test_listing.title == "Test Hotel"
    assert test_listing.price == 100.0
    
    # Test to_dict
    listing_dict = test_listing.to_dict()
    assert listing_dict['title'] == "Test Hotel"
    
    # Test from_dict
    recreated = Listing.from_dict(listing_dict)
    assert recreated.title == "Test Hotel"
    
    print("   ✅ Model creation and serialization working")
except Exception as e:
    print(f"   ❌ Model creation failed: {e}")
    sys.exit(1)

# Test 7: Create search filters
print("\n7. Testing search filters...")
try:
    filters = SearchFilters(
        location="Galle",
        max_price=150,
        available_only=True,
        tags=["beach", "luxury"]
    )
    assert filters.location == "Galle"
    assert filters.max_price == 150
    
    filters_dict = filters.to_dict()
    assert filters_dict['location'] == "Galle"
    
    print("   ✅ Search filters working correctly")
except Exception as e:
    print(f"   ❌ Search filters failed: {e}")
    sys.exit(1)

# Test 8: Check if config exists
print("\n8. Checking Firebase configuration...")
try:
    from config.firebase_admin import init_db
    print("   ✅ Firebase config module found")
    print("   ⚠️  Note: Firebase initialization requires serviceAccountKey.json")
except ImportError as e:
    print(f"   ❌ Firebase config not found: {e}")
    print("   This is OK for testing repository structure")

print("\n" + "="*60)
print("✅ ALL TESTS PASSED!")
print("="*60)
print("\nRepository pattern is correctly installed!")
print("\nNext steps:")
print("1. Configure Firebase (if not done):")
print("   - Add serviceAccountKey.json to backend/config/")
print("   - Set up Firestore database")
print("\n2. Run full example:")
print("   python data/example_usage.py")
print("\n3. Integrate with your service:")
print("   - Update travel_assistant_service.py")
print("   - Update API endpoints")
print("="*60)
