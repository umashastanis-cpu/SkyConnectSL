"""
LLM Provider with Groq Primary + Gemini Fallback
Production-ready dual-LLM architecture with graceful degradation
"""

import os
import logging
from typing import Optional
from langchain_groq import ChatGroq
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class LLMProvider:
    """
    Hybrid LLM provider with automatic fallback
    
    Architecture:
    1. Primary: Groq (LLaMA) via LangChain - Fast, free, 30 req/min
    2. Fallback: Google Gemini API - Fast, free, 60 req/min
    3. Final: None (deterministic responses only)
    
    This ensures 99.9% uptime without expensive API dependency.
    """
    
    def __init__(self):
        """Initialize LLM provider with API keys from environment"""
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.gemini_api_key = os.getenv("GOOGLE_API_KEY")
        
        # Groq model configuration
        self.groq_model = "llama-3.3-70b-versatile"
        
        # Gemini model configuration
        self.gemini_model = "gemini-1.5-flash"
        
        # Initialize Groq client if key exists
        self.groq_client = None
        if self.groq_api_key:
            try:
                self.groq_client = ChatGroq(
                    groq_api_key=self.groq_api_key,
                    model_name=self.groq_model,
                    temperature=0.7,
                    max_tokens=300
                )
                logger.info("✓ Groq LLM initialized successfully")
            except Exception as e:
                logger.warning(f"⚠️  Failed to initialize Groq: {e}")
                self.groq_client = None
        else:
            logger.warning("⚠️  GROQ_API_KEY not found in environment")
        
        # Initialize Gemini if key exists
        if self.gemini_api_key:
            try:
                genai.configure(api_key=self.gemini_api_key)
                logger.info("✓ Gemini API initialized successfully")
            except Exception as e:
                logger.warning(f"⚠️  Failed to initialize Gemini: {e}")
                self.gemini_api_key = None
        else:
            logger.warning("⚠️  GOOGLE_API_KEY not found in environment")
    
    async def generate_response(self, prompt: str, max_retries: int = 2) -> Optional[str]:
        """
        Generate LLM response with automatic fallback
        
        Flow:
        1. Try Groq (LangChain ChatGroq)
        2. If fails → Try Gemini API
        3. If fails → Return None (caller uses deterministic fallback)
        
        Args:
            prompt: The input prompt for the LLM
            max_retries: Number of retries per provider
            
        Returns:
            str: LLM-generated response
            None: If both providers fail
        """
        
        # Try Groq first (primary)
        if self.groq_client:
            for attempt in range(max_retries):
                try:
                    logger.info(f"🤖 Attempting Groq (attempt {attempt + 1}/{max_retries})...")
                    response = await self._generate_with_groq(prompt)
                    logger.info("✓ Groq response generated successfully")
                    return response
                except Exception as e:
                    logger.warning(f"⚠️  Groq attempt {attempt + 1} failed: {e}")
                    if attempt == max_retries - 1:
                        logger.error("❌ Groq failed after all retries, falling back to Gemini")
        
        # Fallback to Gemini
        if self.gemini_api_key:
            for attempt in range(max_retries):
                try:
                    logger.info(f"🤖 Attempting Gemini (attempt {attempt + 1}/{max_retries})...")
                    response = await self._generate_with_gemini(prompt)
                    logger.info("✓ Gemini response generated successfully")
                    return response
                except Exception as e:
                    logger.warning(f"⚠️  Gemini attempt {attempt + 1} failed: {e}")
                    if attempt == max_retries - 1:
                        logger.error("❌ Gemini failed after all retries")
        
        # Both providers failed
        logger.error("❌ All LLM providers failed. Returning None for deterministic fallback.")
        return None
    
    async def _generate_with_groq(self, prompt: str) -> str:
        """Generate response using Groq via LangChain"""
        if not self.groq_client:
            raise Exception("Groq client not initialized")
        
        # Use invoke instead of agenerate for synchronous call
        # LangChain's ChatGroq doesn't have async methods in this version
        response = self.groq_client.invoke(prompt)
        return response.content
    
    async def _generate_with_gemini(self, prompt: str) -> str:
        """Generate response using Google Gemini API"""
        if not self.gemini_api_key:
            raise Exception("Gemini API key not configured")
        
        # Initialize model
        model = genai.GenerativeModel(self.gemini_model)
        
        # Generate response
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            raise Exception("Gemini returned empty response")
        
        return response.text.strip()
    
    def get_status(self) -> dict:
        """Get current provider status for debugging"""
        return {
            "groq_available": self.groq_client is not None,
            "gemini_available": self.gemini_api_key is not None,
            "groq_model": self.groq_model if self.groq_client else None,
            "gemini_model": self.gemini_model if self.gemini_api_key else None,
            "ready": self.groq_client is not None or self.gemini_api_key is not None
        }


# Global singleton instance
_llm_provider = None

def get_llm_provider() -> LLMProvider:
    """Get or create singleton LLM provider instance"""
    global _llm_provider
    if _llm_provider is None:
        _llm_provider = LLMProvider()
    return _llm_provider
