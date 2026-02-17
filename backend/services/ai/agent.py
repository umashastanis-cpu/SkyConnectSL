"""
AI Agent Implementation
Main agent logic for SkyConnect AI
"""

from typing import Optional, Dict, Any
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.llms import Ollama
import os

# Import prompts and tools
from .prompts import TRAVEL_CONCIERGE_SYSTEM_PROMPT
from .base_tools import get_travel_concierge_tools


class TravelConciergeAgent:
    """Main AI agent for travel recommendations and assistance"""
    
    def __init__(self, model_name: str = "llama3.2", temperature: float = 0.7):
        """
        Initialize the travel concierge agent
        
        Args:
            model_name: LLM model to use (default: llama3.2 via Ollama)
            temperature: LLM temperature (0.0-1.0)
        """
        self.model_name = model_name
        self.temperature = temperature
        
        # Initialize LLM provider to None (will be set by _initialize_llm)
        self.llm_provider = None
        
        # Initialize LLM with fallback chain: Ollama → Gemini → Groq → OpenAI → None
        self.llm = self._initialize_llm()
        
        # Get tools
        self.tools = get_travel_concierge_tools()
        
        # Create prompt template
        self.prompt =self._create_prompt_template()
        
        # Conversation history (simple list)
        self.conversation_history = []
    
    def _initialize_llm(self):
        """
        Initialize LLM with fallback chain:
        1. Try Ollama (local, free, no internet needed)
        2. Try Gemini (cloud, FREE tier, generous limits) ⭐ RECOMMENDED
        3. Try Groq (cloud, free tier, fast)
        4. Try OpenAI ChatGPT (cloud, paid, best quality)
        5. Return None (will use SimpleFallbackAgent)
        """
        
        # Try 1: Ollama (local)
        try:
            print("🔍 Attempting to connect to Ollama...")
            llm = Ollama(model=self.model_name, temperature=self.temperature)
            # Test connection
            llm.invoke("test")
            print(f"✅ Connected to Ollama ({self.model_name})")
            self.llm_provider = "ollama"
            return llm
        except Exception as e:
            print(f"⚠️  Ollama not available: {e}")
        
        # Try 2: Google Gemini (cloud, FREE tier - 60 req/min!)
        gemini_api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        if gemini_api_key:
            try:
                print("🔍 Attempting to connect to Google Gemini...")
                from langchain_google_genai import ChatGoogleGenerativeAI
                llm = ChatGoogleGenerativeAI(
                    model="gemini-1.5-flash",
                    temperature=self.temperature,
                    google_api_key=gemini_api_key
                )
                print("✅ Connected to Google Gemini (gemini-1.5-flash) - FREE tier ⭐")
                print("   Rate limit: 60 requests/minute")
                self.llm_provider = "gemini"
                return llm
            except ImportError:
                print("⚠️  langchain-google-genai not installed. Run: pip install langchain-google-genai")
            except Exception as e:
                print(f"⚠️  Gemini connection failed: {e}")
        else:
            print("⚠️  GOOGLE_API_KEY or GEMINI_API_KEY not set")
        
        # Try 3: Groq (cloud, free tier)
        groq_api_key = os.getenv("GROQ_API_KEY")
        if groq_api_key:
            try:
                print("🔍 Attempting to connect to Groq...")
                from langchain_groq import ChatGroq
                llm = ChatGroq(
                    model="llama-3.3-70b-versatile",  # Current Groq model (Dec 2024)
                    temperature=self.temperature,
                    api_key=groq_api_key
                )
                print("✅ Connected to Groq (llama-3.3-70b-versatile) - FREE tier")
                print("   Rate limit: 30 requests/minute")
                self.llm_provider = "groq"
                return llm
            except ImportError:
                print("⚠️  langchain-groq not installed. Run: pip install langchain-groq")
            except Exception as e:
                print(f"⚠️  Groq connection failed: {e}")
        else:
            print("⚠️  GROQ_API_KEY not set")
        
        # Try 4: OpenAI ChatGPT (cloud, paid)
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if openai_api_key:
            try:
                print("🔍 Attempting to connect to OpenAI ChatGPT...")
                from langchain_openai import ChatOpenAI
                llm = ChatOpenAI(
                    model="gpt-4o",
                    temperature=self.temperature,
                    api_key=openai_api_key
                )
                print("✅ Connected to OpenAI ChatGPT (gpt-4o) - PAID")
                self.llm_provider = "openai"
                return llm
            except ImportError:
                print("⚠️  langchain-openai not installed. Run: pip install langchain-openai")
            except Exception as e:
                print(f"⚠️  OpenAI connection failed: {e}")
        else:
            print("⚠️  OPENAI_API_KEY not set")
        
        # No LLM available
        print("\n" + "="*60)
        print("❌ No LLM provider available")
        print("="*60)
        print("FREE options to enable AI agent:")
        print("1. Google Gemini (RECOMMENDED): https://aistudio.google.com/apikey")
        print("   - 60 requests/minute FREE")
        print("   - No credit card needed")
        print("2. Groq: https://console.groq.com")
        print("   - 30 requests/minute FREE")
        print("\nPAID options:")
        print("3. OpenAI ChatGPT: https://platform.openai.com")
        print("   - Best quality (~$0.03/1000 tokens)")
        print("4. Install Ollama (free, local): https://ollama.ai")
        print("   - Requires high PC resources")
        print("\nCurrently using SimpleFallbackAgent (search-based)")
        print("="*60 + "\n")
        self.llm_provider = None
        return None
    
    def _create_prompt_template(self) -> ChatPromptTemplate:
        """Create the chat prompt template"""
        
        return ChatPromptTemplate.from_messages([
            ("system", TRAVEL_CONCIERGE_SYSTEM_PROMPT),
            ("user", "{input}")
        ])
    
    
    async def chat(self, message: str, user_id: Optional[str] = None, conversation_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Process a chat message
        
        Args:
            message: User's message
            user_id: Optional user ID for personalization
            conversation_id: Optional conversation ID for tracking
            
        Returns:
            Dictionary with response and metadata
        """
        if not self.llm:
            return {
                "response": "AI agent is not properly configured. Please set up Groq, Gemini, or another LLM provider.",
                "error": "agent_not_initialized"
            }
        
        try:
            # Create chain
            chain = self.prompt | self.llm
            
            # Enhance message with user context if provided
            enhanced_message = message
            if user_id:
                enhanced_message = f"[User ID: {user_id}] {message}"
            
            # Run LLM
            result = await chain.ainvoke({"input": enhanced_message})
            
            # Extract content from response
            if hasattr(result, 'content'):
                response_text = result.content
            else:
                response_text = str(result)
            
            return {
                "response": response_text,
                "success": True,
                "llm_provider": self.llm_provider,
                "agent_type": "travel_concierge",
                "conversation_id": conversation_id or "groq_session"
            }
            
        except Exception as e:
            print(f"Error in chat: {e}")
            return {
                "response": f"I encountered an error: {str(e)}. Please try rephrasing your question.",
                "error": str(e),
                "success": False
            }
    
    def clear_memory(self):
        """Clear conversation memory"""
        self.conversation_history = []
        print("✅ Memory cleared")


# Singleton instance
_agent_instance = None

def get_agent() -> TravelConciergeAgent:
    """Get or create agent instance"""
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = TravelConciergeAgent()
    return _agent_instance


# Simple fallback for when LLM is not available
class SimpleFallbackAgent:
    """
    Fallback agent using tool-based responses without LLM
    
    This agent works WITHOUT Ollama/Groq/OpenAI - perfect for:
    - Demo purposes
    - Low-resource environments
    - Testing semantic search
    """
    
    def __init__(self):
        self.tools = get_travel_concierge_tools()
        print("\n" + "="*60)
        print("🤖 SimpleFallbackAgent Active")
        print("="*60)
        print("Using search-based responses (no LLM needed)")
        print("Perfect for demos and testing!")
        print("To upgrade: Set GROQ_API_KEY or install Ollama")
        print("="*60 + "\n")
    
    async def chat(self, message: str, user_id: Optional[str] = None, conversation_id: Optional[str] = None) -> Dict[str, Any]:
        """Simple rule-based responses using semantic search"""
        
        message_lower = message.lower()
        
        # Search trigger - most common use case
        if any(word in message_lower for word in ['find', 'search', 'show', 'recommend', 'looking for', 'hotel', 'tour', 'resort', 'beach', 'activity']):
            search_tool = [t for t in self.tools if t.name == "SearchListings"][0]
            result = search_tool._run(query=message, max_results=5)
            
            response = f"{result}\n\nWould you like more details about any of these?"
            
            return {
                "response": response,
                "success": True,
                "agent_type": "fallback",
                "llm_provider": "none (search-based)",
                "conversation_id": conversation_id or "fallback_session"
            }
        
        # Travel guide trigger
        elif any(word in message_lower for word in ['visa', 'weather', 'when', 'best time', 'destination', 'guide', 'culture', 'season']):
            guide_tool = [t for t in self.tools if t.name == "SriLankaTravelGuide"][0]
            result = guide_tool._run(query=message)
            
            return {
                "response": result,
                "success": True,
                "agent_type": "fallback",
                "llm_provider": "none (search-based)",
                "conversation_id": conversation_id or "fallback_session"
            }
        
        # Default response with helpful menu
        else:
            return {
                "response": """👋 Welcome to SkyConnect Sri Lanka!

I can help you with:

🔍 **Find & Search**
   - Tours, hotels, resorts, activities
   - "Find beach resorts in Galle"
   - "Show me cultural tours in Kandy"

📚 **Travel Guide**
   - Best time to visit
   - Visa information
   - Destinations & attractions
   - "When is the best time to visit Sri Lanka?"

💡 **Tips:**
   - Be specific about location and preferences
   - Mention your budget if you have one
   - Ask about activities you're interested in

What would you like to explore?

ℹ️  Currently using search-based responses.
   For AI conversations, set GROQ_API_KEY (free!)
   See GROQ_SETUP.md for details.""",
                "success": True,
                "agent_type": "fallback",
                "llm_provider": "none (search-based)",
                "conversation_id": conversation_id or "fallback_session"
            }
