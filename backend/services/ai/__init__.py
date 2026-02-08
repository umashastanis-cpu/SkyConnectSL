"""
AI Services Package
Contains all AI-related services for the SkyConnect backend
"""

from .embeddings import KnowledgeBaseTrainer
from .agent import TravelConciergeAgent

__all__ = ['KnowledgeBaseTrainer', 'TravelConciergeAgent']
