"""
Query Router
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Intelligent routing layer for hybrid database + LLM system

Key Responsibilities:
- Route queries to correct execution engine (Database vs RAG)
- Coordinate between deterministic data retrieval and LLM formatting
- Prevent LLM hallucination of analytics/revenue data
- Orchestrate hybrid flows (DB + RAG + LLM formatting)
- Performance optimization and caching

Routing Decision Tree:
┌────────────────────────────────────────────────────┐
│ Intent Metadata                                    │
│   requires_db=True, requires_rag=False             │
└─────────────────────┬──────────────────────────────┘
                      ↓
        ┌─────────────────────────────┐
        │ Database Engine             │
        │ • Analytics queries         │
        │ • Revenue calculations      │
        │ • User data retrieval       │
        │ • NO LLM involvement        │
        └─────────────────────────────┘
                      ↓
        ┌─────────────────────────────┐
        │ Optional: LLM Formatter     │
        │ • Conversational tone       │
        │ • NO data modification      │
        └─────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ Intent Metadata                                    │
│   requires_db=False, requires_rag=True             │
└─────────────────────┬──────────────────────────────┘
                      ↓
        ┌─────────────────────────────┐
        │ RAG Engine                  │
        │ • Policy documents          │
        │ • Help articles             │
        │ • Feature guides            │
        │ • Similarity search         │
        └─────────────────────────────┘
                      ↓
        ┌─────────────────────────────┐
        │ LLM Synthesizer             │
        │ • Explain policy            │
        │ • Answer from context       │
        │ • Cite sources              │
        └─────────────────────────────┘

Design Decisions:
1. **No Mixed Routing**: Analytics never use RAG, policies never use DB
2. **LLM as Formatter**: Database results formatted by LLM, NOT generated
3. **Explicit Containment**: RAG engine cannot access database
4. **Performance First**: Cache deterministic queries, skip LLM when possible

Anti-Patterns Prevented:
❌ LLM generating revenue numbers
❌ RAG returning analytics data
❌ Database querying policy documents
❌ Mixing data sources without clear boundaries
"""

from typing import Dict, Any, Optional
from enum import Enum
import logging
import time

from .intent_classifier import Intent, IntentMetadata
from .role_validator import RoleValidationResult, UserRole

logger = logging.getLogger(__name__)


class DataSource(str, Enum):
    """Data source types for query execution"""
    DATABASE = "database"
    VECTOR_DB = "vector_db"
    HYBRID = "hybrid"
    NONE = "none"


class QueryResponse:
    """Structured response from query router"""
    
    def __init__(
        self,
        intent: Intent,
        role: UserRole,
        data_source: DataSource,
        response: str,
        metadata: Dict[str, Any],
        raw_data: Optional[Dict] = None,
        latency_ms: float = 0.0
    ):
        self.intent = intent
        self.role = role
        self.data_source = data_source
        self.response = response
        self.metadata = metadata
        self.raw_data = raw_data
        self.latency_ms = latency_ms
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to JSON-serializable dictionary"""
        result = {
            "intent": self.intent.value,
            "role_scope": self.role.value,
            "data_source": self.data_source.value,
            "response": self.response,
            "metadata": {
                **self.metadata,
                "latency_ms": round(self.latency_ms, 2)
            }
        }
        
        # Include raw data only if explicitly requested
        if self.raw_data is not None:
            result["raw_data"] = self.raw_data
        
        return result


class QueryRouter:
    """
    Production-grade query routing orchestrator
    
    Architecture:
    1. Validate intent metadata
    2. Route to appropriate engine (DB/RAG)
    3. Optional LLM formatting
    4. Structured response assembly
    
    Usage:
        router = QueryRouter(db_engine, rag_engine, llm_provider)
        response = await router.route(
            query="Show my bookings",
            intent_meta=intent_metadata,
            role_validation=role_validation,
            user_id="user123"
        )
    """
    
    def __init__(
        self,
        db_engine: Any,  # DeterministicDataEngine
        rag_engine: Any,  # RAGEngine
        llm_provider: Any,  # LLMProvider
        enable_llm_formatting: bool = True
    ):
        """
        Initialize query router with execution engines
        
        Args:
            db_engine: Database execution engine for analytics/data
            rag_engine: RAG execution engine for policies/help
            llm_provider: LLM provider for formatting (optional)
            enable_llm_formatting: Whether to use LLM for response formatting
        """
        self.db_engine = db_engine
        self.rag_engine = rag_engine
        self.llm_provider = llm_provider
        self.enable_llm_formatting = enable_llm_formatting
        
        logger.info(
            f"QueryRouter initialized (llm_formatting={'enabled' if enable_llm_formatting else 'disabled'})"
        )
    
    async def route(
        self,
        query: str,
        intent_meta: IntentMetadata,
        role_validation: RoleValidationResult,
        user_id: str,
        partner_id: Optional[str] = None,
        include_raw_data: bool = False
    ) -> QueryResponse:
        """
        Route query to appropriate engine and format response
        
        Args:
            query: User's natural language query
            intent_meta: Intent classification metadata
            role_validation: Role validation result
            user_id: Authenticated user ID
            partner_id: Partner ID (for partner-specific queries)
            include_raw_data: Include raw database/RAG results in response
            
        Returns:
            QueryResponse with formatted response and metadata
        """
        start_time = time.time()
        
        try:
            # Determine data source from intent metadata
            data_source = self._determine_data_source(intent_meta)
            
            # Route to appropriate engine
            if data_source == DataSource.DATABASE:
                response = await self._route_to_database(
                    query=query,
                    intent=intent_meta.intent,
                    user_id=user_id,
                    partner_id=partner_id,
                    role=role_validation.role
                )
            
            elif data_source == DataSource.VECTOR_DB:
                response = await self._route_to_rag(
                    query=query,
                    intent=intent_meta.intent,
                    role=role_validation.role
                )
            
            elif data_source == DataSource.HYBRID:
                response = await self._route_hybrid(
                    query=query,
                    intent=intent_meta.intent,
                    user_id=user_id,
                    partner_id=partner_id,
                    role=role_validation.role
                )
            
            else:
                response = self._handle_unknown_intent(query)
            
            # Calculate latency
            latency_ms = (time.time() - start_time) * 1000
            
            # Add latency to metadata
            response.latency_ms = latency_ms
            response.metadata["intent_confidence"] = intent_meta.confidence
            response.metadata["classification_method"] = intent_meta.method
            
            # Remove raw data if not requested
            if not include_raw_data:
                response.raw_data = None
            
            logger.info(
                f"Query routed successfully: intent={intent_meta.intent.value}, "
                f"source={data_source.value}, latency={latency_ms:.2f}ms"
            )
            
            return response
        
        except Exception as e:
            logger.error(f"Error routing query: {e}", exc_info=True)
            
            # Return safe error response
            return QueryResponse(
                intent=intent_meta.intent,
                role=role_validation.role,
                data_source=DataSource.NONE,
                response="I apologize, but I encountered an error processing your request. Please try again.",
                metadata={
                    "error": str(e),
                    "error_type": type(e).__name__
                },
                latency_ms=(time.time() - start_time) * 1000
            )
    
    def _determine_data_source(self, intent_meta: IntentMetadata) -> DataSource:
        """
        Determine data source from intent metadata
        
        Rules:
        - DB only: Analytics, revenue, saved items
        - RAG only: Policies, help, navigation
        - Hybrid: Recommendations (DB + optional RAG context)
        - None: Unknown intents
        """
        if intent_meta.requires_db and not intent_meta.requires_rag:
            return DataSource.DATABASE
        
        elif intent_meta.requires_rag and not intent_meta.requires_db:
            return DataSource.VECTOR_DB
        
        elif intent_meta.requires_db and intent_meta.requires_rag:
            return DataSource.HYBRID
        
        else:
            return DataSource.NONE
    
    async def _route_to_database(
        self,
        query: str,
        intent: Intent,
        user_id: str,
        partner_id: Optional[str],
        role: UserRole
    ) -> QueryResponse:
        """
        Route to deterministic database engine
        
        CRITICAL: LLM never generates data, only formats
        """
        logger.info(f"Routing to database engine: {intent.value}")
        
        # Execute deterministic database query
        raw_data = await self.db_engine.execute(
            intent=intent,
            user_id=user_id,
            partner_id=partner_id,
            role=role
        )
        
        # Optional: Format with LLM (does NOT modify data)
        if self.enable_llm_formatting and raw_data.get("success"):
            formatted_response = await self._format_with_llm(
                raw_data=raw_data,
                intent=intent,
                query=query
            )
        else:
            # Fallback to simple formatting
            formatted_response = self._format_simple(raw_data, intent)
        
        return QueryResponse(
            intent=intent,
            role=role,
            data_source=DataSource.DATABASE,
            response=formatted_response,
            metadata={
                "source": "database",
                "record_count": raw_data.get("count", 0),
                "llm_formatted": self.enable_llm_formatting
            },
            raw_data=raw_data
        )
    
    async def _route_to_rag(
        self,
        query: str,
        intent: Intent,
        role: UserRole
    ) -> QueryResponse:
        """
        Route to RAG engine for policy/help queries
        
        RAG engine handles:
        1. Semantic search in ChromaDB
        2. Similarity threshold filtering
        3. Context assembly
        4. LLM synthesis with citations
        """
        logger.info(f"Routing to RAG engine: {intent.value}")
        
        # Execute RAG retrieval + synthesis
        rag_result = await self.rag_engine.query(
            query=query,
            intent=intent,
            role=role
        )
        
        return QueryResponse(
            intent=intent,
            role=role,
            data_source=DataSource.VECTOR_DB,
            response=rag_result["response"],
            metadata={
                "source": "vector_db",
                "chunks_retrieved": rag_result.get("chunk_count", 0),
                "similarity_scores": rag_result.get("scores", []),
                "citations": rag_result.get("citations", [])
            },
            raw_data=rag_result.get("context")
        )
    
    async def _route_hybrid(
        self,
        query: str,
        intent: Intent,
        user_id: str,
        partner_id: Optional[str],
        role: UserRole
    ) -> QueryResponse:
        """
        Route to hybrid DB + RAG flow
        
        Example: Recommendations
        1. DB: Get user preferences, past bookings
        2. RAG: Get curated travel guides (optional context)
        3. LLM: Synthesize personalized recommendations
        """
        logger.info(f"Routing to hybrid engine: {intent.value}")
        
        # Get database context
        db_data = await self.db_engine.execute(
            intent=intent,
            user_id=user_id,
            partner_id=partner_id,
            role=role
        )
        
        # Get RAG context (optional enrichment)
        rag_data = await self.rag_engine.query(
            query=query,
            intent=intent,
            role=role
        )
        
        # Synthesize with LLM
        if self.enable_llm_formatting:
            formatted_response = await self._synthesize_hybrid(
                query=query,
                db_data=db_data,
                rag_data=rag_data,
                intent=intent
            )
        else:
            formatted_response = self._format_simple(db_data, intent)
        
        return QueryResponse(
            intent=intent,
            role=role,
            data_source=DataSource.HYBRID,
            response=formatted_response,
            metadata={
                "source": "hybrid",
                "db_records": db_data.get("count", 0),
                "rag_chunks": rag_data.get("chunk_count", 0)
            },
            raw_data={
                "database": db_data,
                "rag": rag_data.get("context")
            }
        )
    
    def _handle_unknown_intent(self, query: str) -> QueryResponse:
        """Handle unknown or low-confidence intents"""
        logger.warning(f"Unknown intent for query: {query}")
        
        return QueryResponse(
            intent=Intent.UNKNOWN,
            role=UserRole.TRAVELER,  # Default safe role
            data_source=DataSource.NONE,
            response=(
                "I'm not sure I understand your question. Could you please rephrase? "
                "I can help with:\n"
                "• Finding hotels and experiences\n"
                "• Viewing your saved items\n"
                "• Checking analytics (for partners)\n"
                "• Explaining policies and guidelines\n"
                "• Answering how-to questions"
            ),
            metadata={
                "clarification_requested": True,
                "suggestions": [
                    "Show me beach resorts",
                    "What have I saved?",
                    "How many views did I get?",
                    "What's the refund policy?"
                ]
            }
        )
    
    async def _format_with_llm(
        self,
        raw_data: Dict,
        intent: Intent,
        query: str
    ) -> str:
        """
        Format database results with LLM for conversational tone
        
        CRITICAL: LLM receives data as read-only context
        Data is NOT modified or generated by LLM
        """
        system_prompt = f"""You are a helpful assistant formatting structured data for users.

CRITICAL RULES:
1. Use ONLY the data provided in the context
2. DO NOT invent, calculate, or modify numbers
3. DO NOT add information not in the data
4. Present the data in a friendly, conversational tone
5. Keep responses concise and clear

Intent: {intent.value}
User Query: {query}

Data to format:
{raw_data}

Format this data in a natural, helpful response."""

        response = await self.llm_provider.generate(
            prompt=system_prompt,
            max_tokens=300,
            temperature=0.3  # Low temperature = more deterministic
        )
        
        return response or self._format_simple(raw_data, intent)
    
    async def _synthesize_hybrid(
        self,
        query: str,
        db_data: Dict,
        rag_data: Dict,
        intent: Intent
    ) -> str:
        """
        Synthesize response from both DB and RAG context
        
        Used for hybrid queries like recommendations
        """
        system_prompt = f"""You are a travel assistant helping users discover experiences.

Use the database data (user preferences, past bookings) and knowledge base context 
to create a personalized response.

RULES:
1. Prioritize database data for user-specific information
2. Use knowledge base for general travel insights
3. DO NOT invent data not provided
4. Be conversational and helpful

Intent: {intent.value}
Query: {query}

Database Context:
{db_data}

Knowledge Base Context:
{rag_data.get('response', '')}

Provide a helpful, personalized response."""

        response = await self.llm_provider.generate(
            prompt=system_prompt,
            max_tokens=500,
            temperature=0.7
        )
        
        return response or self._format_simple(db_data, intent)
    
    def _format_simple(self, data: Dict, intent: Intent) -> str:
        """
        Simple fallback formatting without LLM
        
        Used when LLM is disabled or unavailable
        """
        if not data.get("success"):
            return data.get("message", "No data available")
        
        # Intent-specific simple formatting
        if intent == Intent.ANALYTICS:
            return f"Analytics: {data.get('count', 0)} items found"
        
        elif intent == Intent.SAVED_ITEMS:
            return f"You have {data.get('count', 0)} saved items"
        
        elif intent == Intent.REVENUE:
            return f"Revenue: ${data.get('total', 0):.2f}"
        
        else:
            return str(data.get("message", "Query completed successfully"))


# Singleton instances
_router_instance: Optional[QueryRouter] = None


def get_query_router(
    db_engine: Any,
    rag_engine: Any,
    llm_provider: Any,
    enable_llm_formatting: bool = True
) -> QueryRouter:
    """Get or create singleton query router instance"""
    global _router_instance
    if _router_instance is None:
        _router_instance = QueryRouter(
            db_engine=db_engine,
            rag_engine=rag_engine,
            llm_provider=llm_provider,
            enable_llm_formatting=enable_llm_formatting
        )
    return _router_instance
