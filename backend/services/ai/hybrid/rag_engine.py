"""
RAG Engine (Retrieval-Augmented Generation)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Contained RAG system for policy documents and help content ONLY

Key Responsibilities:
- Semantic search in ChromaDB for policies/help docs
- Similarity threshold filtering (>= 0.75)
- Context assembly with citations
- LLM synthesis of retrieved content
- NEVER answer analytics or revenue questions

CRITICAL CONTAINMENT RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━
1. RAG can ONLY access policy/help documents (no database access)
2. If query is about analytics/revenue → return refusal message
3. If no relevant context found → refuse to answer (no hallucination)
4. Always cite source documents in responses
5. Similarity score must be >= 0.75 to use content

Supported Document Types:
┌────────────────────────────────────────────────────────────────┐
│ Policy Documents (PDPA, Terms, Guidelines)                     │
│  ├─ Partner Commission Policy                                  │
│  ├─ Refund & Cancellation Policy                               │
│  ├─ PDPA Compliance Guide                                      │
│  ├─ Data Protection Policy                                     │
│  └─ Content Moderation Guidelines                              │
├────────────────────────────────────────────────────────────────┤
│ Help & Navigation Guides                                       │
│  ├─ Partner Onboarding Guide                                   │
│  ├─ Listing Creation Tutorial                                  │
│  ├─ Profile Management Guide                                   │
│  ├─ Payment Setup Instructions                                 │
│  └─ Troubleshooting Common Issues                              │
└────────────────────────────────────────────────────────────────┘

Design Decisions:
1. **High Similarity Threshold**: 0.75+ ensures relevant results only
2. **Citation Required**: Every response includes source document reference
3. **Refusal on Miss**: No context = no answer (prevents hallucination)
4. **Semantic Chunking**: 500-800 tokens per chunk for context preservation
5. **LLM as Synthesizer**: LLM explains content, doesn't generate it

Performance:
- Embedding generation: ~50ms
- ChromaDB search: ~20-50ms
- LLM synthesis: ~500-1500ms
- Total latency: ~600-1600ms (acceptable for policy queries)
"""

from typing import Dict, Any, List, Optional
import logging
import chromadb
from chromadb.config import Settings

from .intent_classifier import Intent
from .role_validator import UserRole

logger = logging.getLogger(__name__)


class RAGEngine:
    """
    Production-grade RAG engine with strict containment
    
    Architecture:
    1. Semantic search in ChromaDB
    2. Similarity filtering (>= threshold)
    3. Context assembly with citations
    4. LLM synthesis
    5. Refusal on low relevance
    
    Usage:
        engine = RAGEngine(chroma_client, llm_provider)
        result = await engine.query(
            query="What's the refund policy?",
            intent=Intent.POLICY,
            role=UserRole.TRAVELER
        )
        # Returns: {"response": "...", "citations": [...], "chunk_count": 3}
    """
    
    # Collections in ChromaDB
    POLICY_COLLECTION = "skyconnect_policies"
    HELP_COLLECTION = "skyconnect_help_docs"
    
    # Similarity threshold for relevance
    SIMILARITY_THRESHOLD = 0.75
    
    # Maximum chunks to retrieve
    MAX_CHUNKS = 5
    
    def __init__(
        self,
        chroma_client: chromadb.Client,
        llm_provider: Any,
        similarity_threshold: float = 0.75
    ):
        """
        Initialize RAG engine with ChromaDB and LLM provider
        
        Args:
            chroma_client: ChromaDB client instance
            llm_provider: LLM provider for synthesis
            similarity_threshold: Minimum similarity for relevance
        """
        self.chroma = chroma_client
        self.llm = llm_provider
        self.similarity_threshold = similarity_threshold
        
        # Initialize collections
        try:
            self.policy_collection = self.chroma.get_or_create_collection(
                name=self.POLICY_COLLECTION,
                metadata={"description": "SkyConnect policy documents"}
            )
            
            self.help_collection = self.chroma.get_or_create_collection(
                name=self.HELP_COLLECTION,
                metadata={"description": "SkyConnect help and tutorial documents"}
            )
            
            logger.info("RAGEngine initialized with ChromaDB collections")
        
        except Exception as e:
            logger.error(f"Error initializing ChromaDB collections: {e}")
            raise
    
    async def query(
        self,
        query: str,
        intent: Intent,
        role: UserRole,
        max_chunks: int = MAX_CHUNKS
    ) -> Dict[str, Any]:
        """
        Execute RAG query with strict containment
        
        Args:
            query: User's natural language query
            intent: Classified intent
            role: User's role
            max_chunks: Maximum number of chunks to retrieve
            
        Returns:
            Dictionary with response, citations, and metadata
        """
        
        # CONTAINMENT CHECK: Refuse analytics/revenue queries
        if intent in [Intent.ANALYTICS, Intent.REVENUE, Intent.SAVED_ITEMS]:
            logger.warning(f"RAG refusing analytics/data query: {intent.value}")
            return self._refusal_response(
                "I cannot provide analytics or revenue data. Please use the analytics dashboard or ask an admin."
            )
        
        # Determine which collection to search
        collection = self._select_collection(intent)
        
        # Semantic search
        search_results = await self._semantic_search(
            query=query,
            collection=collection,
            max_results=max_chunks
        )
        
        # Filter by similarity threshold
        relevant_chunks = self._filter_by_similarity(
            results=search_results,
            threshold=self.similarity_threshold
        )
        
        # If no relevant context, refuse to answer
        if not relevant_chunks:
            logger.warning(f"No relevant context found for query: {query}")
            return self._refusal_response(
                "I don't have enough information to answer that question accurately. "
                "Please contact support or check the help documentation."
            )
        
        # Assemble context with citations
        context, citations = self._assemble_context(relevant_chunks)
        
        # Synthesize response with LLM
        response = await self._synthesize_with_llm(
            query=query,
            context=context,
            intent=intent
        )
        
        return {
            "success": True,
            "response": response,
            "citations": citations,
            "chunk_count": len(relevant_chunks),
            "scores": [chunk["score"] for chunk in relevant_chunks],
            "context": context  # Raw context for debugging
        }
    
    def _select_collection(self, intent: Intent) -> chromadb.Collection:
        """Select appropriate ChromaDB collection based on intent"""
        if intent == Intent.POLICY:
            return self.policy_collection
        elif intent in [Intent.NAVIGATION, Intent.TROUBLESHOOTING]:
            return self.help_collection
        else:
            # Default to help collection
            return self.help_collection
    
    async def _semantic_search(
        self,
        query: str,
        collection: chromadb.Collection,
        max_results: int
    ) -> List[Dict]:
        """
        Perform semantic search in ChromaDB
        
        Returns list of results with scores
        """
        try:
            results = collection.query(
                query_texts=[query],
                n_results=max_results,
                include=["documents", "metadatas", "distances"]
            )
            
            # Convert ChromaDB results to standardized format
            formatted_results = []
            
            if results and results["documents"] and len(results["documents"]) > 0:
                for i in range(len(results["documents"][0])):
                    formatted_results.append({
                        "text": results["documents"][0][i],
                        "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                        "distance": results["distances"][0][i] if results["distances"] else 1.0,
                        "score": 1.0 - results["distances"][0][i] if results["distances"] else 0.0
                    })
            
            logger.info(f"Semantic search returned {len(formatted_results)} results")
            return formatted_results
        
        except Exception as e:
            logger.error(f"Semantic search error: {e}", exc_info=True)
            return []
    
    def _filter_by_similarity(
        self,
        results: List[Dict],
        threshold: float
    ) -> List[Dict]:
        """
        Filter results by similarity threshold
        
        Only keep results with score >= threshold
        """
        filtered = [r for r in results if r["score"] >= threshold]
        
        logger.info(
            f"Filtered {len(results)} results to {len(filtered)} "
            f"above threshold {threshold}"
        )
        
        return filtered
    
    def _assemble_context(
        self,
        chunks: List[Dict]
    ) -> tuple[str, List[Dict]]:
        """
        Assemble context from relevant chunks with citations
        
        Returns:
            (context_text, citations_list)
        """
        context_parts = []
        citations = []
        
        for i, chunk in enumerate(chunks, 1):
            # Add chunk text with citation marker
            context_parts.append(f"[Source {i}]\n{chunk['text']}\n")
            
            # Create citation entry
            citation = {
                "id": i,
                "source": chunk["metadata"].get("source", "Unknown"),
                "section": chunk["metadata"].get("section", ""),
                "score": round(chunk["score"], 3)
            }
            citations.append(citation)
        
        context_text = "\n---\n".join(context_parts)
        
        return context_text, citations
    
    async def _synthesize_with_llm(
        self,
        query: str,
        context: str,
        intent: Intent
    ) -> str:
        """
        Synthesize response from context using LLM
        
        CRITICAL: LLM synthesizes from context, does NOT generate facts
        """
        
        system_prompt = f"""You are a helpful assistant explaining SkyConnect policies and features.

CRITICAL RULES:
1. Answer ONLY from the provided context
2. DO NOT add information not in the context
3. DO NOT make up policies or procedures
4. Cite sources using [Source N] markers
5. If context is insufficient, say "I don't have enough information"
6. Be clear, concise, and helpful

Intent: {intent.value}
User Query: {query}

Context:
{context}

Provide a clear, helpful answer based ONLY on the context above."""

        try:
            response = await self.llm.generate(
                prompt=system_prompt,
                max_tokens=500,
                temperature=0.3  # Low temperature for factual synthesis
            )
            
            return response or "I apologize, but I couldn't generate a response. Please try again."
        
        except Exception as e:
            logger.error(f"LLM synthesis error: {e}")
            return "I apologize, but I encountered an error generating the response. Please try again."
    
    def _refusal_response(self, message: str) -> Dict[str, Any]:
        """Create structured refusal response"""
        return {
            "success": False,
            "response": message,
            "citations": [],
            "chunk_count": 0,
            "scores": [],
            "context": None,
            "refusal": True
        }
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Document Indexing Methods (for initial setup)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    async def index_policy_document(
        self,
        document_id: str,
        title: str,
        content: str,
        section: str = "",
        chunk_size: int = 700
    ) -> bool:
        """
        Index a policy document into ChromaDB
        
        Args:
            document_id: Unique document ID
            title: Document title
            content: Full document text
            section: Section name (optional)
            chunk_size: Maximum chunk size in characters
            
        Returns:
            True if successful
        """
        try:
            # Split content into semantic chunks
            chunks = self._semantic_chunk(content, chunk_size)
            
            # Prepare for ChromaDB insertion
            ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]
            metadatas = [
                {
                    "source": title,
                    "section": section,
                    "chunk_index": i,
                    "total_chunks": len(chunks)
                }
                for i in range(len(chunks))
            ]
            
            # Add to collection
            self.policy_collection.add(
                ids=ids,
                documents=chunks,
                metadatas=metadatas
            )
            
            logger.info(f"Indexed policy document: {title} ({len(chunks)} chunks)")
            return True
        
        except Exception as e:
            logger.error(f"Error indexing policy document: {e}")
            return False
    
    async def index_help_document(
        self,
        document_id: str,
        title: str,
        content: str,
        category: str = "",
        chunk_size: int = 700
    ) -> bool:
        """Index a help document into ChromaDB"""
        try:
            chunks = self._semantic_chunk(content, chunk_size)
            
            ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]
            metadatas = [
                {
                    "source": title,
                    "category": category,
                    "chunk_index": i,
                    "total_chunks": len(chunks)
                }
                for i in range(len(chunks))
            ]
            
            self.help_collection.add(
                ids=ids,
                documents=chunks,
                metadatas=metadatas
            )
            
            logger.info(f"Indexed help document: {title} ({len(chunks)} chunks)")
            return True
        
        except Exception as e:
            logger.error(f"Error indexing help document: {e}")
            return False
    
    def _semantic_chunk(self, text: str, max_chunk_size: int) -> List[str]:
        """
        Split text into semantic chunks
        
        Simple implementation: split by paragraphs, combine until max size
        Production: Use more sophisticated semantic chunking
        """
        paragraphs = text.split("\n\n")
        chunks = []
        current_chunk = ""
        
        for para in paragraphs:
            if len(current_chunk) + len(para) <= max_chunk_size:
                current_chunk += para + "\n\n"
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = para + "\n\n"
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks


# Singleton instance
_rag_engine_instance: Optional[RAGEngine] = None


def get_rag_engine(chroma_client, llm_provider) -> RAGEngine:
    """Get or create singleton RAG engine instance"""
    global _rag_engine_instance
    if _rag_engine_instance is None:
        _rag_engine_instance = RAGEngine(chroma_client, llm_provider)
    return _rag_engine_instance
