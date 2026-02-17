"""
Test Script for Hybrid AI Assistant System
Tests all three services: Travel Assistant, Partner Analytics, Admin Moderation
"""

import asyncio
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.ai.llm_provider import get_llm_provider
from services.ai.travel_assistant_service import get_travel_assistant
from services.ai.partner_analytics_service import get_analytics_service
from services.ai.admin_moderation_service import get_moderation_service


def print_header(title):
    """Print a nice header"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70 + "\n")


def print_result(label, value):
    """Print a labeled result"""
    print(f"✓ {label}: {value}")


async def test_llm_provider():
    """Test 1: LLM Provider Status"""
    print_header("TEST 1: LLM Provider Status")
    
    try:
        llm = get_llm_provider()
        status = llm.get_status()
        
        print_result("Groq Available", "✓ YES" if status["groq_available"] else "✗ NO")
        print_result("Gemini Available", "✓ YES" if status["gemini_available"] else "✗ NO")
        print_result("System Ready", "✓ YES" if status["ready"] else "✗ NO")
        
        if status["groq_model"]:
            print_result("Groq Model", status["groq_model"])
        if status["gemini_model"]:
            print_result("Gemini Model", status["gemini_model"])
        
        # Test generation
        print("\n🧪 Testing LLM generation...")
        test_prompt = "Say 'Hello from SkyConnect AI!' in one sentence."
        response = await llm.generate_response(test_prompt)
        
        if response:
            print(f"✓ LLM Response: {response[:100]}...")
            return True
        else:
            print("⚠️  LLM returned None (both providers failed)")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


async def test_travel_assistant():
    """Test 2: Travel Assistant Service"""
    print_header("TEST 2: Travel Assistant Service")
    
    try:
        assistant = get_travel_assistant()
        
        # Test matching (deterministic - no LLM)
        print("🧪 Testing deterministic matching...")
        test_user_id = "test_user_123"
        
        matches = await assistant.match_listings(test_user_id, limit=3)
        print_result("Matches Found", len(matches))
        
        if matches:
            print("\nTop matches:")
            for i, match in enumerate(matches[:3], 1):
                title = match.get("title", "Unknown")
                score = match.get("match_score", 0)
                print(f"  {i}. {title} (Score: {score})")
        
        # Test AI response generation
        print("\n🧪 Testing AI response generation...")
        test_query = "I want to explore beaches and cultural sites in Sri Lanka"
        
        response = await assistant.generate_response(
            user_id=test_user_id,
            query=test_query
        )
        
        print_result("Response Success", response.get("success"))
        print_result("Message Source", response.get("source"))
        print(f"\n💬 AI Message:\n{response.get('message')}\n")
        print_result("Recommendations", len(response.get("recommendations", [])))
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_partner_analytics():
    """Test 3: Partner Analytics Service"""
    print_header("TEST 3: Partner Analytics Service")
    
    try:
        analytics = get_analytics_service()
        
        # Test analytics generation
        print("🧪 Testing analytics generation...")
        test_partner_id = "test_partner_456"
        
        report = await analytics.get_partner_analytics(
            partner_id=test_partner_id,
            period_days=30,
            include_llm_summary=True
        )
        
        print_result("Report Success", report.get("success"))
        
        if report.get("success"):
            metrics = report.get("metrics", {})
            
            print("\n📊 Metrics Summary:")
            if "listings" in metrics:
                print(f"  Total Listings: {metrics['listings'].get('total', 0)}")
                print(f"  Approved: {metrics['listings'].get('approved', 0)}")
                print(f"  Pending: {metrics['listings'].get('pending', 0)}")
            
            if "engagement" in metrics:
                print(f"  Total Views: {metrics['engagement'].get('total_views', 0)}")
                print(f"  Total Bookings: {metrics['engagement'].get('total_bookings', 0)}")
                print(f"  Conversion: {metrics['engagement'].get('conversion_rate', 0)}%")
            
            # Show AI summary
            if report.get("ai_summary"):
                print(f"\n💬 AI Summary ({report.get('summary_source')}):")
                print(f"  {report['ai_summary']}\n")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_admin_moderation():
    """Test 4: Admin Moderation Service"""
    print_header("TEST 4: Admin Moderation Service")
    
    try:
        moderation = get_moderation_service()
        
        # Test partner moderation
        print("🧪 Testing partner moderation (rule-based)...")
        test_partner_id = "test_partner_789"
        
        result = await moderation.moderate_partner_application(test_partner_id)
        
        print_result("Moderation Success", result.get("success"))
        
        if result.get("success"):
            print_result("Decision", result.get("decision"))
            print_result("Score", f"{result.get('score')}/100")
            
            if result.get("reasons"):
                print("\n📋 Reasons:")
                for reason in result.get("reasons")[:5]:  # Show first 5
                    print(f"  - {reason}")
        
        # Test listing moderation
        print("\n🧪 Testing listing moderation (rule-based)...")
        test_listing_id = "test_listing_999"
        
        result = await moderation.moderate_listing(test_listing_id)
        
        if result.get("success"):
            print_result("Decision", result.get("decision"))
            print_result("Score", f"{result.get('score')}/100")
            print_result("Percentage", f"{result.get('percentage')}%")
            
            if result.get("issues"):
                print("\n⚠️  Issues Found:")
                for issue in result.get("issues"):
                    print(f"  - {issue}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def run_all_tests():
    """Run all tests"""
    print("\n" + "🚀"*35)
    print("  SKYCONNECT AI ASSISTANT - COMPREHENSIVE TEST SUITE")
    print("🚀"*35)
    
    results = {}
    
    # Test 1: LLM Provider
    results["llm_provider"] = await test_llm_provider()
    
    # Test 2: Travel Assistant
    results["travel_assistant"] = await test_travel_assistant()
    
    # Test 3: Partner Analytics
    results["partner_analytics"] = await test_partner_analytics()
    
    # Test 4: Admin Moderation
    results["admin_moderation"] = await test_admin_moderation()
    
    # Summary
    print_header("TEST SUMMARY")
    
    total_tests = len(results)
    passed_tests = sum(1 for v in results.values() if v)
    
    for test_name, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status} - {test_name.replace('_', ' ').title()}")
    
    print(f"\n{'='*70}")
    print(f"  Results: {passed_tests}/{total_tests} tests passed")
    print(f"{'='*70}\n")
    
    if passed_tests == total_tests:
        print("🎉 ALL TESTS PASSED! System is ready.\n")
    else:
        print("⚠️  Some tests failed. Check logs above for details.\n")
    
    return passed_tests == total_tests


if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Check for API keys
    groq_key = os.getenv("GROQ_API_KEY")
    gemini_key = os.getenv("GOOGLE_API_KEY")
    
    print("\n📋 Environment Check:")
    print(f"  GROQ_API_KEY: {'✓ Set' if groq_key else '✗ Missing'}")
    print(f"  GOOGLE_API_KEY: {'✓ Set' if gemini_key else '✗ Missing'}")
    
    if not groq_key and not gemini_key:
        print("\n⚠️  WARNING: No LLM API keys found!")
        print("   System will work but use fallback responses only.")
        print("   Add GROQ_API_KEY or GOOGLE_API_KEY to .env file.\n")
    
    # Run tests
    success = asyncio.run(run_all_tests())
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)
