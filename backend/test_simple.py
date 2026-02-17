"""Test imports without Unicode characters"""
try:
    print("1. Testing data layer...")
    from data import FirestoreRepository, CachedRepository
    print("   OK - Data layer imported")
except Exception as e:
    print(f"   FAILED - Data layer: {e}")
    import traceback
    traceback.print_exc()

try:
    print("2. Testing Firebase config...")
    from config.firebase_admin import get_firestore_client
    print("   OK - Firebase config imported")
except Exception as e:
    print(f"   FAILED - Firebase config: {e}")
    import traceback
    traceback.print_exc()

try:
    print("3. Testing travel assistant...")
    from services.ai.travel_assistant_service import get_travel_assistant
    print("   OK - Travel assistant imported")
except Exception as e:
    print(f"   FAILED - Travel assistant: {e}")
    import traceback
    traceback.print_exc()

try:
    print("4. Testing main.py import...")
    from main import app
    print("   OK - Main app imported")
    print("\nSUCCESS - All imports working!")
except Exception as e:
    print(f"   FAILED - Main app: {e}")
    import traceback
    traceback.print_exc()
