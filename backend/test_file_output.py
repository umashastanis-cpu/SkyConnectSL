"""Test imports and write results to file"""
import sys

with open("test_results.txt", "w") as f:
    f.write("Starting tests...\n")
    
    try:
        f.write("1. Testing data layer...\n")
        from data import FirestoreRepository, CachedRepository
        f.write("   ✅ Data layer OK\n")
    except Exception as e:
        f.write(f"   ❌ Data layer failed: {e}\n")
        import traceback
        f.write(traceback.format_exc())
    
    try:
        f.write("2. Testing Firebase config...\n")
        from config.firebase_admin import get_firestore_client
        f.write("   ✅ Firebase config OK\n")
    except Exception as e:
        f.write(f"   ❌ Firebase config failed: {e}\n")
        import traceback
        f.write(traceback.format_exc())
    
    try:
        f.write("3. Testing travel assistant...\n")
        from services.ai.travel_assistant_service import get_travel_assistant
        f.write("   ✅ Travel assistant OK\n")
    except Exception as e:
        f.write(f"   ❌ Travel assistant failed: {e}\n")
        import traceback
        f.write(traceback.format_exc())
        
    try:
        f.write("4. Testing main.py import...\n")
        from main import app
        f.write("   ✅ Main app OK\n")
    except Exception as e:
        f.write(f"   ❌ Main app failed: {e}\n")
        import traceback
        f.write(traceback.format_exc())
    
    f.write("\nDone!\n")

print("Test completed - check test_results.txt")
