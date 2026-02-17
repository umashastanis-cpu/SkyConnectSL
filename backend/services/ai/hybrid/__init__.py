"""
Hybrid AI System Package
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Production-grade hybrid LLM + database system for SkyConnect

This package implements a scalable architecture that:
1. Uses intent classification to route queries intelligently
2. Enforces strict role-based access control
3. Uses deterministic database logic for analytics
4. Uses RAG ONLY for policy/help documents
5. Prevents LLM hallucination of data
6. Returns structured JSON responses
7. Implements safe LLM fallback (Groq → Gemini)
8. Logs all routing decisions and performance metrics

Architecture Overview:
━━━━━━━━━━━━━━━━━━━━

User Query
    ↓
IntentClassifier (keyword + embedding)
    ↓
RoleValidator (strict access control)
    ↓
QueryRouter (intelligent routing)
    ↓
┌─────────────────────────┬───────────────────────┐
│ DeterministicDataEngine │    RAGEngine          │
│ • Analytics             │    • Policies         │
│ • Revenue               │    • Help docs        │
│ • User data             │    • Guides           │
│ • NO LLM involvement    │    • LLM synthesis    │
└─────────────────────────┴───────────────────────┘
    ↓
LLMProvider (Groq → Gemini fallback)
    ↓
Structured JSON Response

Key Components:
- IntentClassifier: Hybrid rule-based + embedding classification
- RoleValidator: Role-based access control middleware
- QueryRouter: Intelligent query routing orchestrator
- DeterministicDataEngine: Pure database operations
- RAGEngine: Contained retrieval-augmented generation
- HybridLLMProvider: Resilient LLM with fallback

Usage Example:
    from services.ai.hybrid import HybridAISystem
    
    system = HybridAISystem(
        firestore_service=firestore_service,
        chroma_client=chroma_client
    )
    
    response = await system.query(
        query="Show me my booking analytics",
        user_id="user123",
        role="partner"
    )
"""

from .intent_classifier import (
    IntentClassifier,
    Intent,
    IntentMetadata,
    get_intent_classifier
)

from .role_validator import (
    RoleValidator,
    UserRole,
    RoleValidationResult,
    get_role_validator,
    verify_role_access
)

from .query_router import (
    QueryRouter,
    DataSource,
    QueryResponse,
    get_query_router
)

from .data_engine import (
    DeterministicDataEngine,
    TimeRange,
    get_data_engine
)

from .rag_engine import (
    RAGEngine,
    get_rag_engine
)

from .llm_provider_fallback import (
    HybridLLMProvider,
    LLMProvider,
    LLMResponse,
    get_hybrid_llm_provider
)

__all__ = [
    # Intent Classification
    "IntentClassifier",
    "Intent",
    "IntentMetadata",
    "get_intent_classifier",
    
    # Role Validation
    "RoleValidator",
    "UserRole",
    "RoleValidationResult",
    "get_role_validator",
    "verify_role_access",
    
    # Query Routing
    "QueryRouter",
    "DataSource",
    "QueryResponse",
    "get_query_router",
    
    # Data Engine
    "DeterministicDataEngine",
    "TimeRange",
    "get_data_engine",
    
    # RAG Engine
    "RAGEngine",
    "get_rag_engine",
    
    # LLM Provider
    "HybridLLMProvider",
    "LLMProvider",
    "LLMResponse",
    "get_hybrid_llm_provider",
    
    # Main System
    "HybridAISystem"
]

__version__ = "1.0.0"
__author__ = "SkyConnect AI Team"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Main Hybrid AI System Orchestrator
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class HybridAISystem:
    """
    Main orchestrator for hybrid AI system
    
    This class ties together all components and provides a simple
    interface for querying the system.
    
    Usage:
        system = HybridAISystem(firestore_service, chroma_client)
        
        response = await system.query(
            query="Show me beach resorts in Sri Lanka",
            user_id="user123",
            role="traveler"
        )
        
        print(response.to_dict())
    """
    
    def __init__(
        self,
        firestore_service,
        chroma_client,
        groq_api_key: Optional[str] = None,
        gemini_api_key: Optional[str] = None,
        enable_llm_formatting: bool = True
    ):
        """
        Initialize hybrid AI system with all components
        
        Args:
            firestore_service: Firestore service instance
            chroma_client: ChromaDB client instance
            groq_api_key: Optional Groq API key
            gemini_api_key: Optional Gemini API key
            enable_llm_formatting: Enable LLM formatting of responses
        """
        # Initialize components
        self.intent_classifier = get_intent_classifier()
        self.role_validator = get_role_validator()
        self.llm_provider = get_hybrid_llm_provider(groq_api_key, gemini_api_key)
        self.data_engine = get_data_engine(firestore_service)
        self.rag_engine = get_rag_engine(chroma_client, self.llm_provider)
        self.query_router = get_query_router(
            self.data_engine,
            self.rag_engine,
            self.llm_provider,
            enable_llm_formatting
        )
        
        logger.info("HybridAISystem initialized successfully")
    
    async def query(
        self,
        query: str,
        user_id: str,
        role: str,
        partner_id: Optional[str] = None,
        include_raw_data: bool = False
    ) -> QueryResponse:
        """
        Process user query through hybrid AI system
        
        Args:
            query: Natural language query
            user_id: Authenticated user ID
            role: User role (traveler/partner/admin)
            partner_id: Partner ID for partner queries
            include_raw_data: Include raw DB/RAG results
            
        Returns:
            QueryResponse with formatted response and metadata
        """
        try:
            # 1. Classify intent
            intent_meta = await self.intent_classifier.classify(query)
            
            logger.info(
                f"Intent classified: {intent_meta.intent.value} "
                f"(confidence={intent_meta.confidence:.2f}, method={intent_meta.method})"
            )
            
            # 2. Validate role access
            user_role = UserRole(role)
            role_validation = await self.role_validator.validate(
                user_id=user_id,
                role=user_role,
                intent=intent_meta.intent,
                resource_owner_id=partner_id or user_id
            )
            
            if not role_validation.allowed:
                logger.warning(f"Access denied: {role_validation.reason}")
                return self._create_access_denied_response(role_validation)
            
            # 3. Route query to appropriate engine
            response = await self.query_router.route(
                query=query,
                intent_meta=intent_meta,
                role_validation=role_validation,
                user_id=user_id,
                partner_id=partner_id,
                include_raw_data=include_raw_data
            )
            
            logger.info(
                f"Query processed successfully: "
                f"intent={intent_meta.intent.value}, "
                f"source={response.data_source.value}, "
                f"latency={response.latency_ms:.2f}ms"
            )
            
            return response
        
        except Exception as e:
            logger.error(f"Error processing query: {e}", exc_info=True)
            return self._create_error_response(str(e))
    
    def _create_access_denied_response(
        self,
        role_validation: RoleValidationResult
    ) -> QueryResponse:
        """Create response for access denied"""
        return QueryResponse(
            intent=role_validation.intent,
            role=role_validation.role,
            data_source=DataSource.NONE,
            response=(
                f"Access denied: {role_validation.reason}\n\n"
                f"Your current role ({role_validation.role.value}) does not have "
                f"permission to perform this action."
            ),
            metadata={
                "error": "access_denied",
                "role": role_validation.role.value,
                "intent": role_validation.intent.value
            },
            latency_ms=0
        )
    
    def _create_error_response(self, error_message: str) -> QueryResponse:
        """Create response for system errors"""
        return QueryResponse(
            intent=Intent.UNKNOWN,
            role=UserRole.TRAVELER,
            data_source=DataSource.NONE,
            response="I apologize, but I encountered an error processing your request. Please try again.",
            metadata={
                "error": "system_error",
                "error_message": error_message
            },
            latency_ms=0
        )
    
    def get_stats(self) -> Dict[str, Any]:
        """Get system statistics"""
        return {
            "llm_provider": self.llm_provider.get_stats()
        }
