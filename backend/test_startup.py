"""Quick test to check if main.py can be imported"""
try:
    print("Testing data layer imports...")
    from data import FirestoreRepository, CachedRepository
    print("✅ Data layer imports successful")
    
    print("\nTesting Firebase config imports...")
    from config.firebase_admin import initialize_firebase, get_firestore_client
    print("✅ Firebase config imports successful")
    
    print("\nTesting travel assistant...")
    from services.ai.travel_assistant_service import get_travel_assistant
    print("✅ Travel assistant imports successful")
    
    print("\nTesting main app import...")
    from main import app
    print("✅ Main app imported successfully!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
