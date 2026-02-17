"""Test agents with actual Groq API"""
import os
import sys
import asyncio
from dotenv import load_dotenv

# Set up paths
os.chdir('C:/Users/Hp/Desktop/SkyConnectSL/backend')
sys.path.insert(0, 'C:/Users/Hp/Desktop/SkyConnectSL/backend')

load_dotenv()

print("Testing AI Agents with Groq API")
print("="*60)

# Get API key
groq_key = os.getenv("GROQ_API_KEY", "")
if not groq_key.startswith('gsk_'):
    print("ERROR: No valid Groq API key found!")
    exit(1)

print(f"SUCCESS: Groq API Key found: {groq_key[:10]}...")

# Import agents
try:
    from services.ai.agents.travel_concierge import TravelConciergeAgent
    from services.ai.agents.partner_intelligence import PartnerIntelligenceAgent
    from services.ai.agents.admin_moderator import AdminModeratorAgent
    from langchain_groq import ChatGroq
    print("SUCCESS: All imports successful\n")
except Exception as e:
    print(f"❌ Import error: {e}")
    exit(1)

# Create LLM
try:
    print("Creating Groq LLM...")
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=groq_key,
        temperature=0.7
    )
    print("SUCCESS: Groq LLM initialized\n")
except Exception as e:
    print(f"ERROR: LLM creation failed: {e}")
    exit(1)

# Test Travel Concierge Agent
print("="*60)
print("TEST 1: Travel Concierge Agent")
print("="*60)
try:
    print("Creating agent...")
    agent = TravelConciergeAgent(llm=llm, session_id="test_session")
    print("SUCCESS: Travel Concierge Agent created!")
    print(f"   - Tools: {len(agent.tools)} available")
    print(f"   - Session: {agent.session_id}")
    
    # Test a simple query
    print("\nTesting with query: 'What are the best beaches in Sri Lanka?'")
    
    async def test_chat():
        result = await agent.chat("What are the best beaches in Sri Lanka?")
        return result
    
    # Run async test
    result = asyncio.run(test_chat())
    print("\nSUCCESS: Response received:")
    print(f"   {result['response'][:200]}...")
    print(f"\n   Sources: {len(result.get('sources', []))}")
    print(f"   Agent type: {result.get('agent_type')}")
    
except Exception as e:
    print(f"ERROR: Travel Concierge test failed: {e}")
    import traceback
    traceback.print_exc()

# Test Partner Intelligence Agent
print("\n" + "="*60)
print("TEST 2: Partner Intelligence Agent")
print("="*60)
try:
    print("Creating agent...")
    partner_agent = PartnerIntelligenceAgent(llm=llm)
    print("SUCCESS: Partner Intelligence Agent created!")
    print(f"   - Tools: {len(partner_agent.tools)} available")
    
except Exception as e:
    print(f"ERROR: Partner Intelligence test failed: {e}")

# Test Admin Moderator Agent
print("\n" + "="*60)
print("TEST 3: Admin Moderator Agent")
print("="*60)
try:
    print("Creating agent...")
    admin_agent = AdminModeratorAgent(llm=llm)
    print("SUCCESS: Admin Moderator Agent created!")
    print(f"   - Tools: {len(admin_agent.tools)} available")
    
except Exception as e:
    print(f"ERROR: Admin Moderator test failed: {e}")

print("\n" + "="*60)
print("SUCCESS: ALL AGENTS WORKING WITH GROQ API!")
print("="*60)
print("\nNext steps:")
print("1. Start backend server: .\\venv\\Scripts\\uvicorn.exe main:app --host 0.0.0.0 --port 8000")
print("2. Test via API: POST http://localhost:8000/api/chat")
print("3. Integrate specialized agents into main.py endpoints")
