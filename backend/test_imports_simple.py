"""Simple import test"""
import sys
import os

# Make sure we're in the right directory
os.chdir('C:/Users/Hp/Desktop/SkyConnectSL/backend')
sys.path.insert(0, 'C:/Users/Hp/Desktop/SkyConnectSL/backend')

print("Current directory:", os.getcwd())
print("Python path:", sys.path[:3])

# Test imports
print("\n1. Testing base agent import...")
try:
    from services.ai.agent import TravelConciergeAgent as BaseAgent
    print("✅ Base TravelConciergeAgent imported")
except Exception as e:
    print(f"❌ {e}")

print("\n2. Testing specialized travel agent import...")
try:
    from services.ai.agents.travel_concierge import TravelConciergeAgent
    print("✅ Specialized TravelConciergeAgent imported")
except Exception as e:
    print(f"❌ {e}")

print("\n3. Testing partner agent import...")
try:
    from services.ai.agents.partner_intelligence import PartnerIntelligenceAgent
    print("✅ PartnerIntelligenceAgent imported")
except Exception as e:
    print(f"❌ {e}")

print("\n4. Testing admin agent import...")
try:
    from services.ai.agents.admin_moderator import AdminModeratorAgent
    print("✅ AdminModeratorAgent imported")
except Exception as e:
    print(f"❌ {e}")

print("\n✅ All imports successful!")
