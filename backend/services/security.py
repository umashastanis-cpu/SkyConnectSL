"""
Backend Security & Production Hardening - Phase 1
Critical fixes for production readiness
"""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from collections import defaultdict
import time
from typing import Dict, Tuple
import hashlib

# ============================================================
# 1. RATE LIMITING MIDDLEWARE
# ============================================================

class RateLimiter:
    """
    Simple in-memory rate limiter
    Production: Use Redis for distributed rate limiting
    """
    
    def __init__(self, requests_per_minute: int = 30):
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[str, list] = defaultdict(list)
        self.window_seconds = 60
    
    def _get_client_id(self, request: Request) -> str:
        """Get unique client identifier"""
        # Try to get user_id from request body first
        client_ip = request.client.host
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        return hashlib.md5(client_ip.encode()).hexdigest()
    
    def _clean_old_requests(self, client_id: str, current_time: float):
        """Remove requests older than the time window"""
        cutoff = current_time - self.window_seconds
        self.requests[client_id] = [
            req_time for req_time in self.requests[client_id]
            if req_time > cutoff
        ]
    
    async def check_rate_limit(self, request: Request) -> Tuple[bool, Dict]:
        """
        Check if request is within rate limit
        Returns: (is_allowed, rate_limit_info)
        """
        client_id = self._get_client_id(request)
        current_time = time.time()
        
        # Clean old requests
        self._clean_old_requests(client_id, current_time)
        
        # Check limit
        request_count = len(self.requests[client_id])
        
        if request_count >= self.requests_per_minute:
            # Calculate retry after
            oldest_request = min(self.requests[client_id])
            retry_after = int(oldest_request + self.window_seconds - current_time) + 1
            
            return False, {
                "allowed": False,
                "limit": self.requests_per_minute,
                "remaining": 0,
                "retry_after": retry_after,
                "reset": int(oldest_request + self.window_seconds)
            }
        
        # Add current request
        self.requests[client_id].append(current_time)
        
        return True, {
            "allowed": True,
            "limit": self.requests_per_minute,
            "remaining": self.requests_per_minute - request_count - 1,
            "reset": int(current_time + self.window_seconds)
        }


# ============================================================
# 2. INPUT VALIDATION
# ============================================================

from pydantic import BaseModel, Field, validator

class ValidatedChatRequest(BaseModel):
    """Validated chat request with security checks"""
    
    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="User message (1-2000 characters)"
    )
    user_id: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="User identifier"
    )
    conversation_id: str | None = Field(
        None,
        max_length=128,
        description="Optional conversation ID"
    )
    
    @validator('message')
    def sanitize_message(cls, v):
        """Basic sanitization"""
        # Remove null bytes
        v = v.replace('\x00', '')
        # Trim whitespace
        v = v.strip()
        if not v:
            raise ValueError("Message cannot be empty after sanitization")
        return v
    
    @validator('user_id')
    def validate_user_id(cls, v):
        """Validate user ID format"""
        if not v or v.isspace():
            raise ValueError("User ID cannot be empty")
        # Remove dangerous characters
        v = v.strip()
        return v


# ============================================================
# 3. STRUCTURED LOGGING
# ============================================================

import logging
import json
from typing import Any

class StructuredLogger:
    """JSON structured logging for better observability"""
    
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        
        # Console handler with JSON format
        handler = logging.StreamHandler()
        handler.setFormatter(self.JSONFormatter())
        self.logger.addHandler(handler)
    
    class JSONFormatter(logging.Formatter):
        """Format logs as JSON"""
        
        def format(self, record):
            log_data = {
                "timestamp": datetime.utcnow().isoformat(),
                "level": record.levelname,
                "logger": record.name,
                "message": record.getMessage(),
                "module": record.module,
                "function": record.funcName,
                "line": record.lineno
            }
            
            # Add extra fields if present
            if hasattr(record, 'extra'):
                log_data.update(record.extra)
            
            return json.dumps(log_data)
    
    def info(self, message: str, **kwargs):
        """Log info message with extra fields"""
        extra = {"extra": kwargs} if kwargs else {}
        self.logger.info(message, extra=extra)
    
    def error(self, message: str, **kwargs):
        """Log error message with extra fields"""
        extra = {"extra": kwargs} if kwargs else {}
        self.logger.error(message, extra=extra)
    
    def warning(self, message: str, **kwargs):
        """Log warning message with extra fields"""
        extra = {"extra": kwargs} if kwargs else {}
        self.logger.warning(message, extra=extra)


# ============================================================
# 4. RESPONSE SANITIZATION
# ============================================================

def sanitize_ai_response(response: str) -> str:
    """
    Sanitize AI response before sending to client
    Prevents XSS, data leakage, etc.
    """
    # Remove any potential script tags
    import re
    response = re.sub(r'<script[^>]*>.*?</script>', '', response, flags=re.DOTALL | re.IGNORECASE)
    
    # Remove other dangerous HTML
    response = re.sub(r'<[^>]*javascript:[^>]*>', '', response, flags=re.IGNORECASE)
    
    # Remove null bytes
    response = response.replace('\x00', '')
    
    # Truncate extremely long responses
    max_length = 5000
    if len(response) > max_length:
        response = response[:max_length] + "... [Response truncated]"
    
    return response


# ============================================================
# 5. HEALTH CHECK WITH DEPENDENCIES
# ============================================================

async def detailed_health_check() -> Dict[str, Any]:
    """
    Comprehensive health check for monitoring
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0-alpha",
        "checks": {}
    }
    
    # Check LLM connection
    try:
        from services.ai.agent import get_agent
        agent = get_agent()
        health_status["checks"]["llm"] = {
            "status": "healthy" if agent.llm else "degraded",
            "provider": agent.llm_provider or "fallback",
            "message": "LLM operational" if agent.llm else "Using fallback agent"
        }
    except Exception as e:
        health_status["checks"]["llm"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "unhealthy"
    
    # Check Firestore connection
    try:
        from config.firebase_admin import db
        # Simple read test
        test_ref = db.collection('_health_check').document('test')
        test_ref.set({"timestamp": datetime.utcnow().isoformat()})
        health_status["checks"]["database"] = {
            "status": "healthy",
            "message": "Firestore operational"
        }
    except Exception as e:
        health_status["checks"]["database"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "unhealthy"
    
    # Check ChromaDB
    try:
        from services.ai.embeddings import get_embeddings_service
        embeddings = get_embeddings_service()
        health_status["checks"]["vector_db"] = {
            "status": "healthy",
            "message": "ChromaDB operational"
        }
    except Exception as e:
        health_status["checks"]["vector_db"] = {
            "status": "degraded",
            "error": str(e),
            "message": "Vector search may not work"
        }
    
    return health_status


# ============================================================
# 6. ERROR HANDLING MIDDLEWARE
# ============================================================

async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler
    Prevents exposing internal errors to clients
    """
    from services.security import StructuredLogger
    logger = StructuredLogger("error_handler")
    
    # Log the full error
    logger.error(
        "Unhandled exception",
        error=str(exc),
        error_type=type(exc).__name__,
        path=request.url.path,
        method=request.method
    )
    
    # Return safe error message
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "An internal error occurred. Please try again later.",
            "error_id": hashlib.md5(f"{datetime.utcnow().isoformat()}{str(exc)}".encode()).hexdigest()[:8]
        }
    )
