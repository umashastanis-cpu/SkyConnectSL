"""
Conversation Store
Manages chat history for AI agents
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from langchain_core.messages import HumanMessage, AIMessage


class ConversationStore:
    """
    Simple in-memory conversation storage
    For production: replace with Redis or database
    """
    
    def __init__(self):
        """Initialize conversation store"""
        # session_id -> list of messages
        self.conversations: Dict[str, List[Dict[str, Any]]] = {}
        # session_id -> metadata
        self.metadata: Dict[str, Dict[str, Any]] = {}
    
    def add_message(self, session_id: str, role: str, content: str, metadata: Optional[Dict] = None):
        """
        Add a message to conversation history
        
        Args:
            session_id: Unique session identifier
            role: 'human' or 'ai'
            content: Message content
            metadata: Optional metadata (user_id, timestamp, etc.)
        """
        if session_id not in self.conversations:
            self.conversations[session_id] = []
            self.metadata[session_id] = {
                'created_at': datetime.now().isoformat(),
                'message_count': 0
            }
        
        message = {
            'role': role,
            'content': content,
            'timestamp': datetime.now().isoformat(),
            'metadata': metadata or {}
        }
        
        self.conversations[session_id].append(message)
        self.metadata[session_id]['message_count'] += 1
        self.metadata[session_id]['updated_at'] = datetime.now().isoformat()
    
    def get_messages(self, session_id: str, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Get conversation history for a session
        
        Args:
            session_id: Session identifier
            limit: Optional limit on number of messages (most recent)
        
        Returns:
            List of message dictionaries
        """
        if session_id not in self.conversations:
            return []
        
        messages = self.conversations[session_id]
        
        if limit:
            return messages[-limit:]
        return messages
    
    def get_langchain_messages(self, session_id: str, limit: Optional[int] = 10) -> List[Any]:
        """
        Get messages in LangChain format (HumanMessage/AIMessage objects)
        
        Args:
            session_id: Session identifier
            limit: Number of recent messages to return
        
        Returns:
            List of LangChain message objects
        """
        messages = self.get_messages(session_id, limit)
        
        langchain_messages = []
        for msg in messages:
            if msg['role'] == 'human':
                langchain_messages.append(HumanMessage(content=msg['content']))
            elif msg['role'] == 'ai':
                langchain_messages.append(AIMessage(content=msg['content']))
        
        return langchain_messages
    
    def clear_session(self, session_id: str):
        """Clear conversation history for a session"""
        if session_id in self.conversations:
            del self.conversations[session_id]
        if session_id in self.metadata:
            del self.metadata[session_id]
    
    def get_session_metadata(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get metadata for a session"""
        return self.metadata.get(session_id)
    
    def get_active_sessions(self) -> List[str]:
        """Get list of active session IDs"""
        return list(self.conversations.keys())


# Global instance (singleton pattern)
_conversation_store = None


def get_conversation_store() -> ConversationStore:
    """
    Get global conversation store instance
    
    Returns:
        ConversationStore instance
    """
    global _conversation_store
    if _conversation_store is None:
        _conversation_store = ConversationStore()
    return _conversation_store
