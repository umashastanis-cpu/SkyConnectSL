"""
Unit Tests for AI Agent
Comprehensive testing suite following TDD best practices
"""

import pytest
import asyncio
import os
from unittest.mock import Mock, patch, AsyncMock

# Set test environment
os.environ['GROQ_API_KEY'] = 'test_key_12345'

# ============================================================
# Test Fixtures
# ============================================================

@pytest.fixture
def mock_llm():
    """Mock LLM for testing without API calls"""
    llm = AsyncMock()
    llm.ainvoke = AsyncMock(return_value=Mock(content="Test response from AI"))
    return llm

@pytest.fixture
def agent_with_mock_llm(mock_llm):
    """Agent with mocked LLM"""
    with patch('services.ai.agent.ChatGroq', return_value=mock_llm):
        from services.ai.agent import TravelConciergeAgent
        agent = TravelConciergeAgent()
        agent.llm = mock_llm
        agent.llm_provider = "mock"
        return agent

# ============================================================
# Test Agent Initialization
# ============================================================

class TestAgentInitialization:
    """Test agent initialization and configuration"""
    
    def test_agent_imports(self):
        """Test that agent classes can be imported"""
        from services.ai.agent import TravelConciergeAgent, SimpleFallbackAgent
        assert TravelConciergeAgent is not None
        assert SimpleFallbackAgent is not None
    
    def test_singleton_pattern(self):
        """Test that get_agent returns singleton"""
        from services.ai.agent import get_agent
        agent1 = get_agent()
        agent2 = get_agent()
        assert agent1 is agent2, "Should return same instance"
    
    def test_agent_has_tools(self):
        """Test that agent initializes with tools"""
        from services.ai.agent import TravelConciergeAgent
        agent = TravelConciergeAgent()
        assert agent.tools is not None
        assert len(agent.tools) > 0

# ============================================================
# Test Chat Functionality
# ============================================================

class TestChatFunctionality:
    """Test chat method behavior"""
    
    @pytest.mark.asyncio
    async def test_chat_returns_response(self, agent_with_mock_llm):
        """Test that chat returns a response"""
        result = await agent_with_mock_llm.chat(
            message="Hello",
            user_id="test_user"
        )
        assert "response" in result
        assert result["response"] is not None
    
    @pytest.mark.asyncio
    async def test_chat_includes_metadata(self, agent_with_mock_llm):
        """Test that response includes metadata"""
        result = await agent_with_mock_llm.chat(
            message="Test",
            user_id="test_user"
        )
        assert "llm_provider" in result
        assert "agent_type" in result
        assert result["agent_type"] == "travel_concierge"
    
    @pytest.mark.asyncio
    async def test_chat_handles_empty_message(self, agent_with_mock_llm):
        """Test handling of empty messages"""
        result = await agent_with_mock_llm.chat(
            message="",
            user_id="test_user"
        )
        # Should still return a response, not crash
        assert "response" in result
    
    @pytest.mark.asyncio
    async def test_chat_handles_none_user_id(self, agent_with_mock_llm):
        """Test handling of None user_id"""
        result = await agent_with_mock_llm.chat(
            message="Test",
            user_id=None
        )
        # Should handle gracefully
        assert "response" in result
    
    @pytest.mark.asyncio
    async def test_chat_conversation_id(self, agent_with_mock_llm):
        """Test conversation_id is preserved"""
        conv_id = "test_conversation_123"
        result = await agent_with_mock_llm.chat(
            message="Test",
            user_id="user123",
            conversation_id=conv_id
        )
        assert result.get("conversation_id") == conv_id

# ============================================================
# Test Fallback Agent
# ============================================================

class TestFallbackAgent:
    """Test SimpleFallbackAgent behavior"""
    
    @pytest.mark.asyncio
    async def test_fallback_agent_works_without_llm(self):
        """Test fallback agent works without LLM"""
        from services.ai.agent import SimpleFallbackAgent
        agent = SimpleFallbackAgent()
        
        result = await agent.chat(
            message="Find me beaches",
            user_id="test"
        )
        
        assert "response" in result
        assert result["llm_provider"] == "none (search-based)"
    
    @pytest.mark.asyncio
    async def test_fallback_handles_search_queries(self):
        """Test fallback processes search queries"""
        from services.ai.agent import SimpleFallbackAgent
        agent = SimpleFallbackAgent()
        
        result = await agent.chat(
            message="Show me hotels in Galle",
            user_id="test"
        )
        
        assert result["success"] is True
        assert len(result["response"]) > 0

# ============================================================
# Test Error Handling
# ============================================================

class TestErrorHandling:
    """Test error handling and edge cases"""
    
    @pytest.mark.asyncio
    async def test_handles_llm_failure(self):
        """Test graceful degradation when LLM fails"""
        with patch('services.ai.agent.ChatGroq', side_effect=Exception("API Error")):
            from services.ai.agent import TravelConciergeAgent
            agent = TravelConciergeAgent()
            
            # Should fall back to SimpleFallbackAgent behavior
            assert agent.llm is None or agent.llm_provider is None
    
    @pytest.mark.asyncio
    async def test_handles_long_message(self, agent_with_mock_llm):
        """Test handling of very long messages"""
        long_message = "test " * 10000  # Very long message
        result = await agent_with_mock_llm.chat(
            message=long_message,
            user_id="test"
        )
        # Should not crash
        assert "response" in result

# ============================================================
# Run Tests
# ============================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
