"""
Travel Concierge Agent - Phase 1 MVP
Helps travelers discover and book experiences in Sri Lanka

Features:
- Natural language understanding
- Context retention (conversation memory)
- Semantic search for listings
- Itinerary planning (1-2 days)
- Distance calculation
- Local tips & safety advice
- Simple preference learning
"""

from typing import Optional, Dict, Any, List
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import AgentExecutor, create_react_agent
from langchain_core.messages import AIMessage, HumanMessage
import os
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

# Import tools from base_tools.py and tools/ subdirectory
from services.ai.base_tools import get_travel_concierge_tools  # From ../base_tools.py
from services.ai.tools.itinerary_tools import get_itinerary_tools  # From ../tools/
from services.ai.prompts import TRAVEL_CONCIERGE_SYSTEM_PROMPT
from services.ai.memory import get_conversation_store


class TravelConciergeAgent:
    """
    Travel Concierge AI Agent - Phase 1 MVP
    
    Capabilities:
    - Search listings (semantic + filters)
    - Create basic itineraries (1-2 days)
    - Calculate distances
    - Provide local tips
    - Remember conversation context
    - Learn user preferences
    """
    
    def __init__(self, llm, session_id: Optional[str] = None):
        """
        Initialize Travel Concierge Agent
        
        Args:
            llm: LangChain LLM instance (Groq, Gemini, etc.)
            session_id: Optional session ID for conversation memory
        """
        self.llm = llm
        self.session_id = session_id or "default"
        
        # Get all tools (base + itinerary)
        base_tools = get_travel_concierge_tools()
        itinerary_tools = get_itinerary_tools()
        self.tools = base_tools + itinerary_tools
        
        # Get conversation memory (global store)
        self.store = get_conversation_store()
        
        # Create agent
        self.agent = self._create_agent()
    
    def _create_agent(self) -> AgentExecutor:
        """Create the agent with tools and memory"""
        from langchain_core.prompts import MessagesPlaceholder
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", TRAVEL_CONCIERGE_SYSTEM_PROMPT + "\n\nYou have access to the following tools:\n\n{tools}\n\nUse the following format:\nQuestion: the input question\nThought: you should always think about what to do\nAction: the action to take (one of [{tool_names}])\nAction Input: the input to the action\nObservation: the result of the action\n... (this Thought/Action/Action Input/Observation can repeat N times)\nThought: I now know the final answer\nFinal Answer: the final answer to the original input question"),
            MessagesPlaceholder(variable_name="chat_history", optional=True),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ])
        
        # Create agent (LangChain 1.2.x compatible)
        agent = create_react_agent(self.llm, self.tools, prompt)
        
        # Create executor
        agent_executor = AgentExecutor(
            agent=agent,
            tools=self.tools,
            verbose=True,
            max_iterations=5,
            handle_parsing_errors=True,
            return_intermediate_steps=True
        )
        
        return agent_executor
    
    async def chat(self, query: str, user_id: Optional[str] = None, 
                   conversation_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Process a chat message
        
        Args:
            query: User's message
            user_id: Optional user ID
            conversation_id: Optional conversation ID
            
        Returns:
            Dict with response, sources, and metadata
        """
        try:
            # Get conversation history from global store
            history = self.store.get_langchain_messages(self.session_id)
            
            # Add user message to history
            self.store.add_message(self.session_id, 'human', query)
            
            # Prepare input
            agent_input = {
                "input": query,
                "chat_history": history,
                "agent_scratchpad": [],  # Required for ReAct agent
                "user_id": user_id or "guest"
            }
            
            print(f"\n🤖 Travel Concierge Agent Processing:")
            print(f"   Query: {query}")
            print(f"   Session: {self.session_id}")
            print(f"   History: {len(history)} messages")
            
            # Run agent
            result = self.agent.invoke(agent_input)
            
            # Add AI response to history
            ai_response = result.get("output", "")
            self.store.add_message(self.session_id, 'ai', ai_response)
            
            # Extract sources from intermediate steps
            sources = []
            if "intermediate_steps" in result:
                for step in result["intermediate_steps"]:
                    if len(step) >= 2:
                        tool_name = step[0].tool if hasattr(step[0], 'tool') else "unknown"
                        sources.append({
                            "tool": tool_name,
                            "result": str(step[1])[:100]  # First 100 chars
                        })
            
            return {
                "response": ai_response,
                "sources": sources,
                "conversation_id": self.session_id,
                "message_count": len(history) + 2,
                "agent_type": "travel_concierge"
            }
            
        except Exception as e:
            print(f"❌ Agent error: {e}")
            import traceback
            traceback.print_exc()
            
            return {
                "response": f"I apologize, but I encountered an error: {str(e)}. Let me try to help you another way. What are you looking for?",
                "sources": [],
                "conversation_id": self.session_id,
                "agent_type": "travel_concierge"
            }
    
    def clear_history(self):
        """Clear conversation history"""
        self.store.clear_session(self.session_id)
        print(f"Cleared conversation history for session: {self.session_id}")
