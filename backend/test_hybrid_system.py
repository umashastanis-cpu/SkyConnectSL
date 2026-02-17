"""
Quick Test Script for Hybrid AI System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tests all core components of the hybrid AI system

Usage:
    python test_hybrid_system.py

Requirements:
    - Backend server running on http://localhost:8000
    - Python 3.11+
    - requests library (pip install requests)
"""

import requests
import json
import time
from typing import Dict, Any
from colorama import init, Fore, Style

# Initialize colorama for colored output
init(autoreset=True)

BASE_URL = "http://localhost:8000"

def print_header(text: str):
    """Print a formatted header"""
    print("\n" + "=" * 80)
    print(Fore.CYAN + Style.BRIGHT + text.center(80))
    print("=" * 80)

def print_success(text: str):
    """Print success message"""
    print(Fore.GREEN + "✓ " + text)

def print_error(text: str):
    """Print error message"""
    print(Fore.RED + "✗ " + text)

def print_info(text: str):
    """Print info message"""
    print(Fore.YELLOW + "ℹ " + text)

def test_health_check() -> bool:
    """Test basic health check"""
    print_header("Test 1: Health Check")
    
    try:
        response = requests.get(f"{BASE_URL}/")
        response.raise_for_status()
        data = response.json()
        
        print_success("Server is online")
        print_info(f"Service: {data.get('service')}")
        print_info(f"Version: {data.get('version')}")
        return True
        
    except Exception as e:
        print_error(f"Health check failed: {e}")
        return False

def test_hybrid_ai_health() -> bool:
    """Test hybrid AI system health"""
    print_header("Test 2: Hybrid AI System Health")
    
    try:
        response = requests.get(f"{BASE_URL}/api/ai/health")
        response.raise_for_status()
        data = response.json()
        
        print_success(f"System Status: {data.get('status')}")
        
        services = data.get('services', {})
        for service, status in services.items():
            if status == "operational":
                print_success(f"{service}: {status}")
            else:
                print_error(f"{service}: {status}")
        
        llm_status = data.get('llm_status', {})
        for provider, status in llm_status.items():
            if status == "available":
                print_success(f"LLM {provider}: {status}")
            else:
                print_error(f"LLM {provider}: {status}")
        
        return data.get('status') == 'healthy'
        
    except Exception as e:
        print_error(f"Health check failed: {e}")
        return False

def test_recommendation_query() -> bool:
    """Test recommendation query (database route)"""
    print_header("Test 3: Recommendation Query (Database Route)")
    
    query_request = {
        "query": "Show me beach resorts in Sri Lanka under $200",
        "user_id": "test_user_123",
        "role": "traveler"
    }
    
    try:
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/api/ai/query",
            json=query_request,
            headers={"Content-Type": "application/json"}
        )
        elapsed_time = (time.time() - start_time) * 1000
        
        response.raise_for_status()
        data = response.json()
        
        print_success(f"Query processed in {elapsed_time:.2f}ms")
        print_info(f"Intent: {data.get('intent')}")
        print_info(f"Data Source: {data.get('data_source')}")
        print_info(f"Classification Method: {data.get('metadata', {}).get('classification_method')}")
        print_info(f"Confidence: {data.get('metadata', {}).get('intent_confidence')}")
        
        # Verify it used database route
        if data.get('data_source') == 'database':
            print_success("Correctly routed to database engine")
        else:
            print_error(f"Wrong data source: {data.get('data_source')}")
        
        return data.get('intent') == 'recommendation_query'
        
    except Exception as e:
        print_error(f"Recommendation query failed: {e}")
        if hasattr(e, 'response'):
            print_error(f"Response: {e.response.text}")
        return False

def test_policy_query() -> bool:
    """Test policy query (RAG route)"""
    print_header("Test 4: Policy Query (RAG Route)")
    
    query_request = {
        "query": "What is your cancellation policy?",
        "user_id": "test_user_123",
        "role": "traveler"
    }
    
    try:
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/api/ai/query",
            json=query_request,
            headers={"Content-Type": "application/json"}
        )
        elapsed_time = (time.time() - start_time) * 1000
        
        response.raise_for_status()
        data = response.json()
        
        print_success(f"Query processed in {elapsed_time:.2f}ms")
        print_info(f"Intent: {data.get('intent')}")
        print_info(f"Data Source: {data.get('data_source')}")
        print_info(f"Classification Method: {data.get('metadata', {}).get('classification_method')}")
        
        # Check if RAG route was used
        if data.get('data_source') in ('knowledge_base', 'vector_db'):
            print_success("Correctly routed to RAG engine")
        else:
            print_error(f"Wrong data source: {data.get('data_source')}")
        
        return data.get('intent') == 'policy_query'
        
    except Exception as e:
        print_error(f"Policy query failed: {e}")
        if hasattr(e, 'response'):
            print_error(f"Response: {e.response.text}")
        return False

def test_analytics_query() -> bool:
    """Test analytics query (database route with RBAC)"""
    print_header("Test 5: Analytics Query (Partner Role)")
    
    query_request = {
        "query": "Show my analytics for this month",
        "user_id": "partner_123",
        "role": "partner",
        "partner_id": "partner_123"
    }
    
    try:
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/api/ai/query",
            json=query_request,
            headers={"Content-Type": "application/json"}
        )
        elapsed_time = (time.time() - start_time) * 1000
        
        response.raise_for_status()
        data = response.json()
        
        print_success(f"Query processed in {elapsed_time:.2f}ms")
        print_info(f"Intent: {data.get('intent')}")
        print_info(f"Role Scope: {data.get('role_scope')}")
        print_info(f"Data Source: {data.get('data_source')}")
        
        return data.get('intent') == 'analytics_query'
        
    except Exception as e:
        print_error(f"Analytics query failed: {e}")
        if hasattr(e, 'response'):
            print_error(f"Response: {e.response.text}")
        return False

def test_rbac_violation() -> bool:
    """Test that RBAC properly blocks unauthorized queries"""
    print_header("Test 6: RBAC Violation (Should Fail)")
    
    # Traveler trying to access partner analytics
    query_request = {
        "query": "Show partner analytics",
        "user_id": "traveler_123",
        "role": "traveler"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/ai/query",
            json=query_request,
            headers={"Content-Type": "application/json"}
        )
        
        # This should return 403 or raise an error
        if response.status_code == 403:
            print_success("RBAC correctly blocked unauthorized query")
            return True
        elif response.status_code == 200:
            data = response.json()
            # Check if the response contains an error
            if "error" in data.get('response', '').lower() or "permission" in data.get('response', '').lower():
                print_success("RBAC correctly returned permission error")
                return True
            else:
                print_error("RBAC failed - query was allowed")
                return False
        else:
            print_error(f"Unexpected status code: {response.status_code}")
            return False
        
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 403:
            print_success("RBAC correctly blocked unauthorized query")
            return True
        else:
            print_error(f"Unexpected error: {e}")
            return False
    except Exception as e:
        print_error(f"RBAC test failed: {e}")
        return False

def test_statistics() -> bool:
    """Test statistics endpoint"""
    print_header("Test 7: System Statistics")
    
    try:
        response = requests.get(f"{BASE_URL}/api/ai/stats")
        response.raise_for_status()
        data = response.json()
        
        print_success(f"Total Queries: {data.get('total_queries', 0)}")
        
        intent_dist = data.get('intent_distribution', {})
        print_info("Intent Distribution:")
        for intent, count in intent_dist.items():
            print(f"  - {intent}: {count}")
        
        role_dist = data.get('role_distribution', {})
        print_info("Role Distribution:")
        for role, count in role_dist.items():
            print(f"  - {role}: {count}")
        
        routing_dist = data.get('routing_distribution', {})
        print_info("Routing Distribution:")
        for route, count in routing_dist.items():
            print(f"  - {route}: {count}")
        
        perf = data.get('performance', {})
        print_info("Performance Metrics:")
        print(f"  - Average Latency: {perf.get('average_latency_ms', 0):.2f}ms")
        print(f"  - P50 Latency: {perf.get('p50_latency_ms', 0):.2f}ms")
        print(f"  - P95 Latency: {perf.get('p95_latency_ms', 0):.2f}ms")
        
        llm_stats = data.get('llm_provider_stats', {})
        print_info("LLM Provider Stats:")
        print(f"  - Total Requests: {llm_stats.get('total_requests', 0)}")
        print(f"  - Groq Requests: {llm_stats.get('groq_requests', 0)}")
        print(f"  - Gemini Requests: {llm_stats.get('gemini_requests', 0)}")
        print(f"  - Fallback Rate: {llm_stats.get('fallback_rate', 0):.1%}")
        
        return True
        
    except Exception as e:
        print_error(f"Statistics test failed: {e}")
        return False

def test_examples() -> bool:
    """Test examples endpoint"""
    print_header("Test 8: Example Queries")
    
    try:
        response = requests.get(f"{BASE_URL}/api/ai/examples")
        response.raise_for_status()
        data = response.json()
        
        examples_data = data.get('examples', {})
        
        # Handle both dict and list formats
        if isinstance(examples_data, dict):
            examples_list = list(examples_data.values())
        else:
            examples_list = examples_data
        
        print_success(f"Found {len(examples_list)} example queries")
        
        # Show first 3 examples
        for i in range(min(3, len(examples_list))):
            example = examples_list[i]
            print_info(f"Example {i+1}:")
            print(f"  Query: {example.get('query', 'N/A')}")
            print(f"  Role: {example.get('role', 'N/A')}")
        
        return len(examples_list) > 0
        
    except Exception as e:
        print_error(f"Examples test failed: {e}")
        return False

def run_all_tests():
    """Run all tests and summarize results"""
    print("\n")
    print(Fore.MAGENTA + Style.BRIGHT + "╔═══════════════════════════════════════════════════════════════════════════════╗")
    print(Fore.MAGENTA + Style.BRIGHT + "║    SKYCONNECT SL - HYBRID AI SYSTEM TEST SUITE                               ║")
    print(Fore.MAGENTA + Style.BRIGHT + "╚═══════════════════════════════════════════════════════════════════════════════╝")
    
    tests = [
        ("Basic Health Check", test_health_check),
        ("Hybrid AI System Health", test_hybrid_ai_health),
        ("Recommendation Query", test_recommendation_query),
        ("Policy Query (RAG)", test_policy_query),
        ("Analytics Query (Partner)", test_analytics_query),
        ("RBAC Violation Test", test_rbac_violation),
        ("System Statistics", test_statistics),
        ("Example Queries", test_examples),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print_error(f"Test crashed: {e}")
            results.append((test_name, False))
        
        time.sleep(0.5)  # Small delay between tests
    
    # Print summary
    print_header("TEST SUMMARY")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        if result:
            print_success(f"{test_name}")
        else:
            print_error(f"{test_name}")
    
    print("\n" + "=" * 80)
    if passed == total:
        print(Fore.GREEN + Style.BRIGHT + f"ALL TESTS PASSED! ({passed}/{total})".center(80))
    else:
        print(Fore.YELLOW + Style.BRIGHT + f"TESTS PASSED: {passed}/{total}".center(80))
    print("=" * 80 + "\n")
    
    return passed == total

if __name__ == "__main__":
    try:
        success = run_all_tests()
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n" + Fore.YELLOW + "Tests interrupted by user")
        exit(1)
    except Exception as e:
        print_error(f"Fatal error: {e}")
        exit(1)
