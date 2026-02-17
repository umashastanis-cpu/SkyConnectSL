"""
Logging and Monitoring System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Production-grade logging and monitoring for hybrid AI system

Key Responsibilities:
- Log all query processing events
- Track intent classification accuracy
- Monitor role validation decisions
- Measure query latency (P50, P95, P99)
- Count LLM fallback usage
- Detect security violations
- Performance metrics aggregation

Logged Events:
┌────────────────────────────────────────────────────────────────┐
│ Query Processing                                               │
│  ├─ Intent classification (method, confidence, latency)        │
│  ├─ Role validation (allowed/denied, reason)                   │
│  ├─ Query routing (data source, latency)                       │
│  ├─ Database operations (query type, record count, latency)    │
│  ├─ RAG operations (chunk count, similarity scores, latency)   │
│  └─ LLM generation (provider, tokens, fallback, latency)       │
├────────────────────────────────────────────────────────────────┤
│ Security Events                                                │
│  ├─ Access denied (user_id, role, intent, reason)              │
│  ├─ Scope violations (user_id, resource_owner_id)              │
│  └─ Invalid requests (missing fields, validation errors)       │
├────────────────────────────────────────────────────────────────┤
│ Performance Metrics                                            │
│  ├─ Request latency distribution (P50, P95, P99)               │
│  ├─ LLM fallback rate                                          │
│  ├─ Intent classification accuracy                             │
│  └─ Error rates by component                                   │
└────────────────────────────────────────────────────────────────┘

Log Levels:
- DEBUG: Detailed component operations
- INFO: Query processing flow, successful operations
- WARNING: Access denials, low confidence classifications, fallback usage
- ERROR: Component failures, database errors, LLM errors
- CRITICAL: System-wide failures

Monitoring Integrations:
- Console (development)
- File (production logs)
- CloudWatch (AWS deployment)
- Datadog (future)
- Prometheus (future)
"""

import logging
import time
from typing import Dict, Any, List, Optional
from datetime import datetime
from collections import defaultdict, deque
from enum import Enum
import json


class EventType(str, Enum):
    """Event types for logging"""
    QUERY_START = "query_start"
    INTENT_CLASSIFIED = "intent_classified"
    ROLE_VALIDATED = "role_validated"
    ACCESS_DENIED = "access_denied"
    QUERY_ROUTED = "query_routed"
    DATABASE_QUERY = "database_query"
    RAG_QUERY = "rag_query"
    LLM_GENERATION = "llm_generation"
    LLM_FALLBACK = "llm_fallback"
    QUERY_COMPLETE = "query_complete"
    ERROR = "error"


class MetricsCollector:
    """
    Collects and aggregates metrics for monitoring
    
    Tracks:
    - Request latency percentiles
    - Intent distribution
    - Role validation outcomes
    - LLM fallback rate
    - Error counts
    
    Usage:
        collector = MetricsCollector()
        
        # Log event
        collector.log_event(
            event_type=EventType.QUERY_COMPLETE,
            latency_ms=234.56,
            metadata={"intent": "recommendation_query"}
        )
        
        # Get metrics
        metrics = collector.get_metrics()
    """
    
    def __init__(self, window_size: int = 1000):
        """
        Initialize metrics collector
        
        Args:
            window_size: Number of recent events to track for percentiles
        """
        self.window_size = window_size
        
        # Latency tracking (sliding window)
        self.latencies = deque(maxlen=window_size)
        
        # Event counters
        self.event_counts = defaultdict(int)
        
        # Intent distribution
        self.intent_counts = defaultdict(int)
        
        # Role validation outcomes
        self.role_validation_allowed = 0
        self.role_validation_denied = 0
        
        # LLM metrics
        self.llm_groq_success = 0
        self.llm_gemini_fallback = 0
        self.llm_total_failures = 0
        
        # Error tracking
        self.error_counts = defaultdict(int)
        
        # Start time
        self.start_time = time.time()
        
        logger = logging.getLogger(__name__)
        logger.info("MetricsCollector initialized")
    
    def log_event(
        self,
        event_type: EventType,
        latency_ms: Optional[float] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Log an event and update metrics
        
        Args:
            event_type: Type of event
            latency_ms: Optional latency in milliseconds
            metadata: Optional event metadata
        """
        metadata = metadata or {}
        
        # Increment event counter
        self.event_counts[event_type.value] += 1
        
        # Track latency
        if latency_ms is not None:
            self.latencies.append(latency_ms)
        
        # Intent tracking
        if "intent" in metadata:
            self.intent_counts[metadata["intent"]] += 1
        
        # Role validation tracking
        if event_type == EventType.ROLE_VALIDATED:
            if metadata.get("allowed"):
                self.role_validation_allowed += 1
            else:
                self.role_validation_denied += 1
        
        elif event_type == EventType.ACCESS_DENIED:
            self.role_validation_denied += 1
        
        # LLM tracking
        elif event_type == EventType.LLM_GENERATION:
            provider = metadata.get("provider")
            if provider == "groq":
                self.llm_groq_success += 1
            elif provider == "gemini":
                self.llm_gemini_fallback += 1
        
        elif event_type == EventType.LLM_FALLBACK:
            self.llm_gemini_fallback += 1
        
        # Error tracking
        elif event_type == EventType.ERROR:
            error_type = metadata.get("error_type", "unknown")
            self.error_counts[error_type] += 1
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get aggregated metrics
        
        Returns comprehensive metrics dictionary
        """
        uptime_seconds = time.time() - self.start_time
        total_requests = self.event_counts.get(EventType.QUERY_COMPLETE.value, 0)
        
        # Calculate latency percentiles
        latency_percentiles = self._calculate_percentiles(list(self.latencies))
        
        # Calculate rates
        llm_total = self.llm_groq_success + self.llm_gemini_fallback
        fallback_rate = (
            self.llm_gemini_fallback / llm_total if llm_total > 0 else 0.0
        )
        
        role_validation_total = self.role_validation_allowed + self.role_validation_denied
        access_denied_rate = (
            self.role_validation_denied / role_validation_total
            if role_validation_total > 0 else 0.0
        )
        
        return {
            "uptime_seconds": round(uptime_seconds, 2),
            "total_requests": total_requests,
            "requests_per_second": round(total_requests / uptime_seconds, 2) if uptime_seconds > 0 else 0.0,
            
            "latency": {
                "p50_ms": latency_percentiles["p50"],
                "p95_ms": latency_percentiles["p95"],
                "p99_ms": latency_percentiles["p99"],
                "max_ms": latency_percentiles["max"],
                "min_ms": latency_percentiles["min"]
            },
            
            "events": dict(self.event_counts),
            
            "intents": dict(self.intent_counts),
            
            "role_validation": {
                "allowed": self.role_validation_allowed,
                "denied": self.role_validation_denied,
                "denial_rate": round(access_denied_rate, 3)
            },
            
            "llm": {
                "groq_success": self.llm_groq_success,
                "gemini_fallback": self.llm_gemini_fallback,
                "total_failures": self.llm_total_failures,
                "fallback_rate": round(fallback_rate, 3)
            },
            
            "errors": dict(self.error_counts)
        }
    
    def _calculate_percentiles(self, values: List[float]) -> Dict[str, float]:
        """Calculate latency percentiles"""
        if not values:
            return {
                "p50": 0.0,
                "p95": 0.0,
                "p99": 0.0,
                "max": 0.0,
                "min": 0.0
            }
        
        sorted_values = sorted(values)
        n = len(sorted_values)
        
        return {
            "p50": round(sorted_values[int(n * 0.50)], 2),
            "p95": round(sorted_values[int(n * 0.95)], 2),
            "p99": round(sorted_values[int(n * 0.99)], 2),
            "max": round(max(sorted_values), 2),
            "min": round(min(sorted_values), 2)
        }
    
    def reset(self):
        """Reset all metrics"""
        self.latencies.clear()
        self.event_counts.clear()
        self.intent_counts.clear()
        self.role_validation_allowed = 0
        self.role_validation_denied = 0
        self.llm_groq_success = 0
        self.llm_gemini_fallback = 0
        self.llm_total_failures = 0
        self.error_counts.clear()
        self.start_time = time.time()
        
        logger = logging.getLogger(__name__)
        logger.info("Metrics reset")


class StructuredLogger:
    """
    Structured logging for hybrid AI system
    
    Logs events in JSON format for easy parsing and analysis
    
    Usage:
        logger = StructuredLogger("hybrid_ai")
        
        logger.log_query_start(
            query="Show me beach resorts",
            user_id="user123",
            role="traveler"
        )
        
        logger.log_intent_classified(
            intent="recommendation_query",
            confidence=0.95,
            method="keyword",
            latency_ms=2.34
        )
    """
    
    def __init__(
        self,
        component: str,
        metrics_collector: Optional[MetricsCollector] = None
    ):
        """
        Initialize structured logger
        
        Args:
            component: Component name for logging
            metrics_collector: Optional metrics collector
        """
        self.logger = logging.getLogger(component)
        self.component = component
        self.metrics = metrics_collector
    
    def _log(
        self,
        level: str,
        event_type: EventType,
        message: str,
        **kwargs
    ):
        """Internal log method"""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "component": self.component,
            "event_type": event_type.value,
            "message": message,
            **kwargs
        }
        
        # Log to standard logger
        log_method = getattr(self.logger, level.lower())
        log_method(json.dumps(log_data))
        
        # Update metrics if available
        if self.metrics:
            self.metrics.log_event(
                event_type=event_type,
                latency_ms=kwargs.get("latency_ms"),
                metadata=kwargs
            )
    
    def log_query_start(
        self,
        query: str,
        user_id: str,
        role: str,
        **kwargs
    ):
        """Log query start"""
        self._log(
            "info",
            EventType.QUERY_START,
            f"Query started: {query[:50]}...",
            query=query,
            user_id=user_id,
            role=role,
            **kwargs
        )
    
    def log_intent_classified(
        self,
        intent: str,
        confidence: float,
        method: str,
        latency_ms: float,
        **kwargs
    ):
        """Log intent classification"""
        self._log(
            "info",
            EventType.INTENT_CLASSIFIED,
            f"Intent classified: {intent} (confidence={confidence:.2f})",
            intent=intent,
            confidence=confidence,
            method=method,
            latency_ms=latency_ms,
            **kwargs
        )
    
    def log_role_validated(
        self,
        user_id: str,
        role: str,
        intent: str,
        allowed: bool,
        reason: str = "",
        **kwargs
    ):
        """Log role validation"""
        level = "info" if allowed else "warning"
        event_type = EventType.ROLE_VALIDATED if allowed else EventType.ACCESS_DENIED
        
        self._log(
            level,
            event_type,
            f"Role validation: {role} → {intent} {'allowed' if allowed else 'denied'}",
            user_id=user_id,
            role=role,
            intent=intent,
            allowed=allowed,
            reason=reason,
            **kwargs
        )
    
    def log_query_routed(
        self,
        data_source: str,
        latency_ms: float,
        **kwargs
    ):
        """Log query routing"""
        self._log(
            "info",
            EventType.QUERY_ROUTED,
            f"Query routed to: {data_source}",
            data_source=data_source,
            latency_ms=latency_ms,
            **kwargs
        )
    
    def log_llm_generation(
        self,
        provider: str,
        latency_ms: float,
        tokens_used: Optional[int] = None,
        fallback_used: bool = False,
        **kwargs
    ):
        """Log LLM generation"""
        event_type = EventType.LLM_FALLBACK if fallback_used else EventType.LLM_GENERATION
        
        self._log(
            "info",
            event_type,
            f"LLM generation: {provider} ({latency_ms:.2f}ms{'[FALLBACK]' if fallback_used else ''})",
            provider=provider,
            latency_ms=latency_ms,
            tokens_used=tokens_used,
            fallback_used=fallback_used,
            **kwargs
        )
    
    def log_query_complete(
        self,
        latency_ms: float,
        **kwargs
    ):
        """Log query completion"""
        self._log(
            "info",
            EventType.QUERY_COMPLETE,
            f"Query completed ({latency_ms:.2f}ms)",
            latency_ms=latency_ms,
            **kwargs
        )
    
    def log_error(
        self,
        error: Exception,
        context: str = "",
        **kwargs
    ):
        """Log error"""
        self._log(
            "error",
            EventType.ERROR,
            f"Error in {context}: {str(error)}",
            error_type=type(error).__name__,
            error_message=str(error),
            context=context,
            **kwargs
        )


# Global metrics collector
_metrics_collector: Optional[MetricsCollector] = None


def get_metrics_collector() -> MetricsCollector:
    """Get or create global metrics collector"""
    global _metrics_collector
    if _metrics_collector is None:
        _metrics_collector = MetricsCollector()
    return _metrics_collector


def get_structured_logger(component: str) -> StructuredLogger:
    """Get structured logger for component"""
    metrics = get_metrics_collector()
    return StructuredLogger(component, metrics)
