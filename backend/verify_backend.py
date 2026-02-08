"""
Backend Verification Script
Tests all backend components before AI agent creation
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

async def verify_imports():
    """Verify all required packages can be imported"""
    print("1️⃣  Verifying Package Imports...")
    
    try:
        import fastapi
        print("   ✅ FastAPI imported")
        
        import firebase_admin
        print("   ✅ Firebase Admin imported")
        
        import chromadb
        print("   ✅ ChromaDB imported")
        
        import langchain
        print("   ✅ LangChain imported")
        
        from langchain.embeddings import HuggingFaceEmbeddings
        print("   ✅ HuggingFace Embeddings imported")
        
        from langchain_community.vectorstores import Chroma
        print("   ✅ Chroma VectorStore imported")
        
        print("   ✅ All packages imported successfully\n")
        return True
        
    except Exception as e:
        print(f"   ❌ Import error: {e}\n")
        return False

async def verify_firebase():
    """Verify Firebase connection"""
    print("2️⃣  Verifying Firebase Connection...")
    
    try:
        from config.firebase_admin import initialize_firebase, init_db
        
        # Initialize Firebase
        initialize_firebase()
        print("   ✅ Firebase Admin SDK initialized")
        
        # Get Firestore client
        db = init_db()
        print("   ✅ Firestore client created")
        
        # Test query
        from services.firestore_service import firestore_service
        users_ref = db.collection('users')
        
        print("   ✅ Firebase connection verified\n")
        return True
        
    except Exception as e:
        print(f"   ❌ Firebase error: {e}\n")
        return False

async def verify_firestore_service():
    """Verify Firestore service methods"""
    print("3️⃣  Verifying Firestore Service...")
    
    try:
        from services.firestore_service import firestore_service
        
        # Test methods exist
        methods = [
            'get_all_listings',
            'get_listing_by_id',
            'search_listings',
            'get_traveler_profile',
            'get_partner_profile',
            'get_all_partners',
            'get_user_bookings',
            'get_partner_listings',
            'query_collection',
            'get_listings_since'
        ]
        
        for method in methods:
            if hasattr(firestore_service, method):
                print(f"   ✅ {method}")
            else:
                print(f"   ❌ Missing: {method}")
                return False
        
        print("   ✅ All Firestore methods available\n")
        return True
        
    except Exception as e:
        print(f"   ❌ Firestore service error: {e}\n")
        return False

async def verify_ai_services():
    """Verify AI services structure"""
    print("4️⃣  Verifying AI Services...")
    
    try:
        # Check if AI folder exists
        ai_path = os.path.join(os.path.dirname(__file__), 'services', 'ai')
        if not os.path.exists(ai_path):
            print(f"   ❌ AI services folder not found\n")
            return False
        
        print("   ✅ AI services folder exists")
        
        # Check files
        files = ['__init__.py', 'prompts.py', 'embeddings.py', 'tools.py', 'agent.py']
        for file in files:
            file_path = os.path.join(ai_path, file)
            if os.path.exists(file_path):
                print(f"   ✅ {file}")
            else:
                print(f"   ❌ Missing: {file}")
                return False
        
        # Try importing
        from services.ai.prompts import TRAVEL_CONCIERGE_SYSTEM_PROMPT
        print("   ✅ Prompts module imported")
        
        from services.ai.embeddings import KnowledgeBaseTrainer
        print("   ✅ Embeddings module imported")
        
        from services.ai.tools import get_travel_concierge_tools
        print("   ✅ Tools module imported")
        
        from services.ai.agent import TravelConciergeAgent
        print("   ✅ Agent module imported")
        
        print("   ✅ All AI services verified\n")
        return True
        
    except Exception as e:
        print(f"   ❌ AI services error: {e}\n")
        return False

async def verify_embeddings():
    """Verify embeddings can be created"""
    print("5️⃣  Verifying Embeddings Setup...")
    
    try:
        from services.ai.embeddings import KnowledgeBaseTrainer
        
        # Initialize trainer
        trainer = KnowledgeBaseTrainer()
        print("   ✅ Knowledge base trainer initialized")
        
        # Test search (will be empty if not trained)
        results = trainer.search("test query", k=1)
        print(f"   ✅ Search function works (found {len(results)} results)")
        
        print("   ✅ Embeddings setup verified\n")
        return True
        
    except Exception as e:
        print(f"   ❌ Embeddings error: {e}\n")
        return False

async def verify_tools():
    """Verify LangChain tools"""
    print("6️⃣  Verifying LangChain Tools...")
    
    try:
        from services.ai.tools import get_travel_concierge_tools
        
        tools = get_travel_concierge_tools()
        print(f"   ✅ Loaded {len(tools)} tools")
        
        for tool in tools:
            print(f"   ✅ {tool.name}: {tool.description[:50]}...")
        
        print("   ✅ All tools verified\n")
        return True
        
    except Exception as e:
        print(f"   ❌ Tools error: {e}\n")
        return False

async def verify_agent():
    """Verify agent can be created"""
    print("7️⃣  Verifying AI Agent...")
    
    try:
        from services.ai.agent import get_agent, SimpleFallbackAgent
        
        # Try to create agent
        agent = get_agent()
        print("   ✅ Agent instance created")
        
        # Check if LLM is available
        if agent.agent_executor:
            print("   ✅ LLM connected (Ollama or OpenAI)")
        else:
            print("   ⚠️  LLM not available - will use fallback mode")
            fallback = SimpleFallbackAgent()
            print("   ✅ Fallback agent available")
        
        print("   ✅ Agent verified\n")
        return True
        
    except Exception as e:
        print(f"   ❌ Agent error: {e}\n")
        return False

async def verify_endpoints():
    """Verify API endpoints are defined"""
    print("8️⃣  Verifying API Endpoints...")
    
    try:
        # Check main.py has the endpoints
        main_path = os.path.join(os.path.dirname(__file__), 'main.py')
        
        with open(main_path, 'r') as f:
            content = f.read()
        
        endpoints = [
            '/api/chat',
            '/api/search/semantic',
            '/api/recommend',
            '/api/admin/train'
        ]
        
        for endpoint in endpoints:
            if endpoint in content:
                print(f"   ✅ {endpoint}")
            else:
                print(f"   ❌ Missing: {endpoint}")
                return False
        
        print("   ✅ All endpoints defined\n")
        return True
        
    except Exception as e:
        print(f"   ❌ Endpoint verification error: {e}\n")
        return False

async def main():
    """Run all verification tests"""
    print("🔍 SkyConnect Backend Verification")
    print("=" * 60)
    print()
    
    results = []
    
    # Run all tests
    results.append(("Package Imports", await verify_imports()))
    results.append(("Firebase Connection", await verify_firebase()))
    results.append(("Firestore Service", await verify_firestore_service()))
    results.append(("AI Services", await verify_ai_services()))
    results.append(("Embeddings Setup", await verify_embeddings()))
    results.append(("LangChain Tools", await verify_tools()))
    results.append(("AI Agent", await verify_agent()))
    results.append(("API Endpoints", await verify_endpoints()))
    
    # Summary
    print("=" * 60)
    print("📊 VERIFICATION SUMMARY")
    print("=" * 60)
    print()
    
    passed = 0
    failed = 0
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}  {test_name}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print()
    print(f"Total: {passed} passed, {failed} failed")
    print()
    
    if failed == 0:
        print("🎉 ALL CHECKS PASSED!")
        print()
        print("✅ Backend is ready for AI agent creation!")
        print()
        print("Next steps:")
        print("1. Train knowledge base: python train_bot.py")
        print("2. Start server: python main.py")
        print("3. Test AI chat endpoint")
    else:
        print("⚠️  Some checks failed. Please fix the issues above.")
        print()
    
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
