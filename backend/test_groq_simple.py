import os
import sys
sys.path.insert(0, 'C:/Users/Hp/Desktop/SkyConnectSL/backend')

# Set API key from environment
# Make sure GROQ_API_KEY is set in your environment or .env file
if not os.getenv('GROQ_API_KEY'):
    print("⚠️  GROQ_API_KEY not set! Please set it in your environment.")
    print("   Example: $env:GROQ_API_KEY = 'your_key_here'")

print("\n" + "="*50)
print("  GROQ CONNECTION TEST")
print("="*50)

try:
    from services.ai.agent import TravelConciergeAgent
    
    print("\n🔍 Initializing AI Agent...")
    agent = TravelConciergeAgent()
    
    print(f"\n✅ Agent initialized!")
    print(f"   LLM Provider: {agent.llm_provider}")
    
    if agent.llm_provider == "groq":
        print("\n🎉🎉🎉 SUCCESS! 🎉🎉🎉")
        print("Groq is WORKING PERFECTLY!")
    elif agent.llm_provider is None:
        print("\n⚠️  No LLM connected - using SimpleFallbackAgent")
    else:
        print(f"\n✅ Using: {agent.llm_provider}")
    
    print("\n" + "="*50)
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
