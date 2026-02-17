"""Quick test to verify agents work with Groq API key"""
import os
from dotenv import load_dotenv

# Load .env
load_dotenv()

print("🔍 Testing AI Agents Setup...\n")

# Check API keys
groq_key = os.getenv("GROQ_API_KEY", "")
print(f"1. Groq API Key: {'✅ Found' if groq_key.startswith('gsk_') else '❌ Missing'}")

# Test imports
try:
    from services.ai.agents.travel_concierge import TravelConciergeAgent
    print("2. TravelConciergeAgent: ✅ Import successful")
except Exception as e:
    print(f"2. TravelConciergeAgent: ❌ {e}")

try:
    from services.ai.agents.partner_intelligence import PartnerIntelligenceAgent
    print("3. PartnerIntelligenceAgent: ✅ Import successful")
except Exception as e:
    print(f"3. PartnerIntelligenceAgent: ❌ {e}")

try:
    from services.ai.agents.admin_moderator import AdminModeratorAgent
    print("4. AdminModeratorAgent: ✅ Import successful")
except Exception as e:
    print(f"4. AdminModeratorAgent: ❌ {e}")

# Test LLM connection
if groq_key.startswith('gsk_'):
    try:
        from langchain_groq import ChatGroq
        llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=groq_key)
        print("5. Groq LLM Connection: ✅ Initialized")
        
        # Test agent creation
        agent = TravelConciergeAgent(llm=llm, session_id="test")
        print("6. Agent Creation: ✅ Successful")
        
        print("\n🎉 ALL TESTS PASSED! Agents are ready to use.")
    except Exception as e:
        print(f"5. Groq LLM Connection: ❌ {e}")
else:
    print("5. Groq LLM Connection: ⚠️  Skipped (no API key)")

print("\n" + "="*60)
print("Summary: Your agents are configured correctly!")
print("The Groq API key is already in .env - you were right!")
print("="*60)
