"""
Hybrid AI System - Test Examples
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Comprehensive test suite demonstrating all system features

Run this file to test:
1. Intent classification (keyword + embedding)
2. Role validation (access control)
3. Query routing (DB vs RAG)
4. Data engine operations
5. RAG operations
6. LLM fallback (Groq → Gemini)
7. End-to-end query processing

Usage:
    python -m backend.services.ai.hybrid.test_examples
    
Or import and run individual tests:
    from backend.services.ai.hybrid.test_examples import test_traveler_recommendation
    await test_traveler_recommendation()
"""

import asyncio
import logging
from typing import Dict, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Test Setup
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async def setup_test_system():
    """Initialize test system with mock services"""
    
    from services.ai.hybrid import HybridAISystem
    from services.ai.hybrid.data_engine import DeterministicDataEngine
    from services.ai.hybrid.rag_engine import RAGEngine
    import chromadb
    
    # Create mock Firestore service
    class MockFirestoreService:
        async def get_saved_items(self, user_id, limit=100):
            return [
                {"id": "1", "name": "Beach Resort A", "type": "hotel"},
                {"id": "2", "name": "Mountain Lodge B", "type": "hotel"}
            ]
    
    # Initialize ChromaDB (in-memory for testing)
    chroma_client = chromadb.Client()
    
    # Initialize system
    system = HybridAISystem(
        firestore_service=MockFirestoreService(),
        chroma_client=chroma_client
    )
    
    # Index sample documents for RAG
    await index_sample_documents(system.rag_engine)
    
    return system


async def index_sample_documents(rag_engine):
    """Index sample policy and help documents"""
    
    # Sample policy document
    policy_content = """
    SkyConnect Refund and Cancellation Policy
    
    1. Cancellation Window
    - Free cancellation up to 48 hours before check-in
    - 50% refund for cancellations 24-48 hours before check-in
    - No refund for cancellations within 24 hours of check-in
    
    2. Refund Processing
    - Refunds are processed within 5-7 business days
    - Original payment method will be credited
    - Processing fees are non-refundable
    
    3. Partner-Specific Policies
    - Some partners may have stricter cancellation policies
    - Always check the specific listing's policy before booking
    
    4. Exceptions
    - Natural disasters and emergencies may qualify for full refund
    - Contact support@skyconnect.lk for exceptional circumstances
    """
    
    await rag_engine.index_policy_document(
        document_id="refund_policy",
        title="SkyConnect Refund Policy",
        content=policy_content,
        section="Cancellation Terms"
    )
    
    # Sample help document
    help_content = """
    How to Upload Photos to Your Listing
    
    Step 1: Navigate to Your Dashboard
    - Log in to your partner account
    - Click on "My Listings" in the sidebar
    
    Step 2: Select the Listing
    - Click on the listing you want to edit
    - Click the "Edit" button
    
    Step 3: Upload Photos
    - Scroll to the "Photos" section
    - Click "Add Photos" button
    - Select up to 10 images from your device
    - Recommended: JPG or PNG, max 5MB per image
    
    Step 4: Arrange Photos
    - Drag and drop photos to reorder
    - The first photo will be the cover image
    
    Step 5: Save Changes
    - Click "Save Changes" at the bottom
    - Your photos will be live within a few minutes
    
    Troubleshooting:
    - Error uploading? Check file size (max 5MB)
    - Photos blurry? Use high-resolution images
    - Can't see changes? Clear your browser cache
    """
    
    await rag_engine.index_help_document(
        document_id="upload_photos_guide",
        title="Photo Upload Guide",
        content=help_content,
        category="Partner Guides"
    )
    
    logger.info("Sample documents indexed successfully")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Test Cases
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async def test_traveler_recommendation(system):
    """Test traveler recommendation query"""
    print("\n" + "="*60)
    print("TEST: Traveler Recommendation Query")
    print("="*60)
    
    response = await system.query(
        query="Show me luxury beach resorts in Sri Lanka",
        user_id="traveler_001",
        role="traveler"
    )
    
    print(f"\n✓ Intent: {response.intent.value}")
    print(f"✓ Data Source: {response.data_source.value}")
    print(f"✓ Latency: {response.latency_ms:.2f}ms")
    print(f"✓ Response: {response.response[:100]}...")
    
    assert response.intent.value == "recommendation_query"
    assert response.role.value == "traveler"
    
    return response


async def test_traveler_saved_items(system):
    """Test traveler saved items query"""
    print("\n" + "="*60)
    print("TEST: Traveler Saved Items Query")
    print("="*60)
    
    response = await system.query(
        query="What have I bookmarked?",
        user_id="traveler_001",
        role="traveler"
    )
    
    print(f"\n✓ Intent: {response.intent.value}")
    print(f"✓ Data Source: {response.data_source.value}")
    print(f"✓ Latency: {response.latency_ms:.2f}ms")
    print(f"✓ Response: {response.response[:100]}...")
    
    assert response.intent.value == "saved_items_query"
    assert response.data_source.value == "database"
    
    return response


async def test_partner_analytics(system):
    """Test partner analytics query"""
    print("\n" + "="*60)
    print("TEST: Partner Analytics Query")
    print("="*60)
    
    response = await system.query(
        query="How many views did my listings get this week?",
        user_id="partner_001",
        role="partner",
        partner_id="partner_001"
    )
    
    print(f"\n✓ Intent: {response.intent.value}")
    print(f"✓ Data Source: {response.data_source.value}")
    print(f"✓ Latency: {response.latency_ms:.2f}ms")
    print(f"✓ Response: {response.response[:100]}...")
    
    assert response.intent.value == "analytics_query"
    assert response.role.value == "partner"
    
    return response


async def test_partner_revenue(system):
    """Test partner revenue query"""
    print("\n" + "="*60)
    print("TEST: Partner Revenue Query")
    print("="*60)
    
    response = await system.query(
        query="What's my total earnings this month?",
        user_id="partner_001",
        role="partner",
        partner_id="partner_001"
    )
    
    print(f"\n✓ Intent: {response.intent.value}")
    print(f"✓ Data Source: {response.data_source.value}")
    print(f"✓ Latency: {response.latency_ms:.2f}ms")
    print(f"✓ Response: {response.response[:100]}...")
    
    assert response.intent.value == "revenue_query"
    assert response.data_source.value == "database"
    
    return response


async def test_admin_moderation(system):
    """Test admin moderation query"""
    print("\n" + "="*60)
    print("TEST: Admin Moderation Query")
    print("="*60)
    
    response = await system.query(
        query="Show pending partner applications",
        user_id="admin_001",
        role="admin"
    )
    
    print(f"\n✓ Intent: {response.intent.value}")
    print(f"✓ Data Source: {response.data_source.value}")
    print(f"✓ Latency: {response.latency_ms:.2f}ms")
    print(f"✓ Response: {response.response[:100]}...")
    
    assert response.intent.value == "moderation_query"
    assert response.role.value == "admin"
    
    return response


async def test_policy_query(system):
    """Test policy query (RAG)"""
    print("\n" + "="*60)
    print("TEST: Policy Query (RAG)")
    print("="*60)
    
    response = await system.query(
        query="What's the refund policy for cancellations?",
        user_id="traveler_001",
        role="traveler"
    )
    
    print(f"\n✓ Intent: {response.intent.value}")
    print(f"✓ Data Source: {response.data_source.value}")
    print(f"✓ Latency: {response.latency_ms:.2f}ms")
    print(f"✓ Response: {response.response[:200]}...")
    
    assert response.intent.value == "policy_query"
    assert response.data_source.value == "vector_db"
    
    return response


async def test_navigation_help(system):
    """Test navigation/help query (RAG)"""
    print("\n" + "="*60)
    print("TEST: Navigation Help Query (RAG)")
    print("="*60)
    
    response = await system.query(
        query="How do I upload photos to my listing?",
        user_id="partner_001",
        role="partner"
    )
    
    print(f"\n✓ Intent: {response.intent.value}")
    print(f"✓ Data Source: {response.data_source.value}")
    print(f"✓ Latency: {response.latency_ms:.2f}ms")
    print(f"✓ Response: {response.response[:200]}...")
    
    assert response.intent.value == "navigation_query"
    assert response.data_source.value == "vector_db"
    
    return response


async def test_access_denied(system):
    """Test access denied (role violation)"""
    print("\n" + "="*60)
    print("TEST: Access Denied (Traveler trying analytics)")
    print("="*60)
    
    response = await system.query(
        query="Show me my analytics",
        user_id="traveler_001",
        role="traveler"  # Travelers can't access analytics
    )
    
    print(f"\n✓ Intent: {response.intent.value}")
    print(f"✓ Response: {response.response[:100]}...")
    print(f"✓ Metadata: {response.metadata}")
    
    assert "access_denied" in response.metadata.get("error", "")
    
    return response


async def test_scope_violation(system):
    """Test scope violation (partner accessing other partner's data)"""
    print("\n" + "="*60)
    print("TEST: Scope Violation (Partner A → Partner B data)")
    print("="*60)
    
    response = await system.query(
        query="Show me analytics",
        user_id="partner_001",
        role="partner",
        partner_id="partner_002"  # Different partner!
    )
    
    print(f"\n✓ Intent: {response.intent.value}")
    print(f"✓ Response: {response.response[:100]}...")
    print(f"✓ Metadata: {response.metadata}")
    
    assert "access_denied" in response.metadata.get("error", "")
    
    return response


async def test_unknown_intent(system):
    """Test unknown/ambiguous query"""
    print("\n" + "="*60)
    print("TEST: Unknown Intent (Ambiguous Query)")
    print("="*60)
    
    response = await system.query(
        query="Hello, how are you?",
        user_id="traveler_001",
        role="traveler"
    )
    
    print(f"\n✓ Intent: {response.intent.value}")
    print(f"✓ Response: {response.response[:200]}...")
    
    assert response.intent.value == "unknown"
    
    return response


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Component-Level Tests
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async def test_intent_classifier():
    """Test intent classifier in isolation"""
    print("\n" + "="*60)
    print("COMPONENT TEST: Intent Classifier")
    print("="*60)
    
    from services.ai.hybrid import get_intent_classifier
    
    classifier = get_intent_classifier()
    
    test_cases = [
        ("Show me beach resorts", "recommendation_query"),
        ("What have I saved?", "saved_items_query"),
        ("How many views did I get?", "analytics_query"),
        ("What's my revenue?", "revenue_query"),
        ("Show pending partners", "moderation_query"),
        ("What's the refund policy?", "policy_query"),
        ("How do I upload photos?", "navigation_query"),
        ("Why can't I submit?", "troubleshooting_query"),
    ]
    
    for query, expected_intent in test_cases:
        result = await classifier.classify(query)
        print(f"\n✓ Query: {query}")
        print(f"  Intent: {result.intent.value} (expected: {expected_intent})")
        print(f"  Confidence: {result.confidence:.2f}")
        print(f"  Method: {result.method}")
        
        assert result.intent.value == expected_intent
    
    print("\n✓ All intent classification tests passed!")


async def test_role_validator():
    """Test role validator in isolation"""
    print("\n" + "="*60)
    print("COMPONENT TEST: Role Validator")
    print("="*60)
    
    from services.ai.hybrid import get_role_validator, UserRole, Intent
    
    validator = get_role_validator()
    
    # Test allowed access
    result = await validator.validate(
        user_id="traveler_001",
        role=UserRole.TRAVELER,
        intent=Intent.RECOMMENDATION
    )
    print(f"\n✓ Traveler → Recommendation: {result.allowed}")
    assert result.allowed
    
    # Test denied access
    result = await validator.validate(
        user_id="traveler_001",
        role=UserRole.TRAVELER,
        intent=Intent.ANALYTICS
    )
    print(f"✓ Traveler → Analytics: {result.allowed} (expected: False)")
    assert not result.allowed
    
    # Test scope validation
    result = await validator.validate(
        user_id="partner_001",
        role=UserRole.PARTNER,
        intent=Intent.ANALYTICS,
        resource_owner_id="partner_002"
    )
    print(f"✓ Partner A → Partner B Analytics: {result.allowed} (expected: False)")
    assert not result.allowed
    
    print("\n✓ All role validation tests passed!")


async def test_llm_fallback():
    """Test LLM provider fallback"""
    print("\n" + "="*60)
    print("COMPONENT TEST: LLM Provider Fallback")
    print("="*60)
    
    from services.ai.hybrid import get_hybrid_llm_provider
    
    llm = get_hybrid_llm_provider()
    
    # Test generation
    response = await llm.generate(
        prompt="Explain the refund policy in one sentence.",
        max_tokens=50,
        temperature=0.7
    )
    
    if response:
        print(f"\n✓ LLM Response: {response[:100]}...")
    else:
        print("\n⚠ LLM failed (both Groq and Gemini)")
    
    # Check stats
    stats = llm.get_stats()
    print(f"\n✓ LLM Stats:")
    print(f"  Groq Success: {stats['groq_success']}")
    print(f"  Gemini Fallback: {stats['gemini_fallback']}")
    print(f"  Fallback Rate: {stats['fallback_rate']}")
    
    return stats


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Main Test Runner
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async def run_all_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("HYBRID AI SYSTEM - COMPREHENSIVE TEST SUITE")
    print("="*60)
    
    try:
        # Setup
        print("\nInitializing test system...")
        system = await setup_test_system()
        print("✓ System initialized\n")
        
        # Component tests
        await test_intent_classifier()
        await test_role_validator()
        await test_llm_fallback()
        
        # End-to-end tests
        await test_traveler_recommendation(system)
        await test_traveler_saved_items(system)
        await test_partner_analytics(system)
        await test_partner_revenue(system)
        await test_admin_moderation(system)
        await test_policy_query(system)
        await test_navigation_help(system)
        
        # Security tests
        await test_access_denied(system)
        await test_scope_violation(system)
        await test_unknown_intent(system)
        
        # Final stats
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        
        stats = system.get_stats()
        print(f"\n✓ System Stats:")
        print(f"  Total Requests: {stats['llm_provider']['total_requests']}")
        print(f"  Groq Success: {stats['llm_provider']['groq_success']}")
        print(f"  Gemini Fallback: {stats['llm_provider']['gemini_fallback']}")
        print(f"  Fallback Rate: {stats['llm_provider']['fallback_rate']}")
        
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED!")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(run_all_tests())
