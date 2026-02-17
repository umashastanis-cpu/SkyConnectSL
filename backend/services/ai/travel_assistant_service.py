"""
Travel Assistant Service
Hybrid architecture: Deterministic matching + LLM response formatting + Real-time data
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from collections import Counter
from services.firestore_service import firestore_service
from services.ai.llm_provider import get_llm_provider
from data import DataRepository, SearchFilters

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TravelAssistantService:
    """
    AI Travel Assistant with hybrid architecture:
    
    1. Deterministic matching engine (rule-based scoring)
    2. LLM response formatter (Groq → Gemini → deterministic)
    3. Real-time data fetching (via repository pattern)
    
    NO multi-agent loops. Just smart matching + friendly formatting.
    """
    
    def __init__(self, data_repository: Optional[DataRepository] = None):
        """
        Initialize travel assistant
        
        Args:
            data_repository: Repository for real-time data access (optional for backward compatibility)
        """
        self.llm_provider = get_llm_provider()
        self.data_repo = data_repository
    
    async def match_listings(self, user_id: str, limit: int = 3, query: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Rule-based listing matching with scoring algorithm
        
        Scoring Rules:
        +3 points: Tag matches user preference
        +2 points: Location matches user preference
        +1 point: Category similar to previously liked item
        
        Args:
            user_id: User ID to match preferences
            limit: Maximum number of results
            query: Optional query to extract filters from
        
        Returns top N listings sorted by score
        """
        
        try:
            # Fetch user preferences (with real-time data if repo available)
            if self.data_repo:
                user_prefs = await self.data_repo.get_user_preferences(user_id)
                user_preferences = {
                    "interests": user_prefs.interests if user_prefs else [],
                    "preferred_locations": user_prefs.preferred_locations if user_prefs else []
                }
            else:
                # Fallback to old method
                user_profile = await firestore_service.get_user_profile(user_id, 'traveler')
                if not user_profile:
                    logger.warning(f"No profile found for user {user_id}")
                    user_preferences = {"interests": [], "preferred_locations": []}
                else:
                    user_preferences = {
                        "interests": user_profile.get("interests", []),
                        "preferred_locations": user_profile.get("preferred_locations", [])
                    }
            
            # Fetch user's liked/saved items
            liked_items = await self._get_user_liked_items(user_id)
            
            # Extract categories from liked items
            liked_categories = [item.get("category") for item in liked_items if item.get("category")]
            
            # Parse query to extract filters
            search_filters = self._parse_query_to_filters(query, user_preferences) if query else None
            
            # Fetch listings (with real-time data if repo available)
            if self.data_repo:
                # Use repository for real-time data
                all_listings_models = await self.data_repo.get_listings(filters=search_filters)
                # Convert models to dicts
                all_listings = [listing.to_dict() for listing in all_listings_models]
            else:
                # Fallback to old method
                all_listings = await firestore_service.get_all_listings(status="approved")
            
            if not all_listings:
                logger.warning("No approved listings found")
                return []
            
            # Score each listing
            scored_listings = []
            for listing in all_listings:
                score = 0
                
                # +3 if tag matches user interest
                listing_tags = listing.get("tags", [])
                if isinstance(listing_tags, list):
                    for tag in listing_tags:
                        if tag in user_preferences["interests"]:
                            score += 3
                            break  # Only count once per listing
                
                # +2 if location matches preferred location
                listing_location = listing.get("location", "")
                if listing_location in user_preferences["preferred_locations"]:
                    score += 2
                
                # +1 if category matches liked items
                listing_category = listing.get("category", "")
                if listing_category in liked_categories:
                    score += 1
                
                # Add score to listing
                listing["match_score"] = score
                scored_listings.append(listing)
            
            # Sort by score (descending) and return top N
            scored_listings.sort(key=lambda x: x["match_score"], reverse=True)
            top_listings = scored_listings[:limit]
            
            logger.info(f"✓ Matched {len(top_listings)} listings for user {user_id}")
            return top_listings
            
        except Exception as e:
            logger.error(f"❌ Error matching listings: {e}")
            return []
    
    async def generate_response(
        self, 
        user_id: str, 
        query: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate AI assistant response
        
        Flow:
        1. Match relevant listings (deterministic)
        2. Build structured prompt
        3. Generate LLM response (Groq → Gemini → fallback)
        4. Return formatted response with recommendations
        
        Args:
            user_id: The user's ID
            query: User's natural language query
            context: Optional additional context
            
        Returns:
            {
                "message": "AI-generated or fallback message",
                "recommendations": [list of matched listings],
                "source": "groq" | "gemini" | "fallback"
            }
        """
        
        try:
            # Step 1: Get matched listings (deterministic) with query parsing
            matched_listings = await self.match_listings(user_id, limit=3, query=query)
            
            # Step 2: Get user preferences for prompt
            user_profile = await firestore_service.get_user_profile(user_id, 'traveler')
            user_interests = user_profile.get("interests", []) if user_profile else []
            
            # Step 3: Build structured prompt
            prompt = self._build_prompt(
                user_interests=user_interests,
                user_query=query,
                matched_listings=matched_listings,
                context=context
            )
            
            # Step 4: Generate LLM response
            llm_response = await self.llm_provider.generate_response(prompt)
            
            # Step 5: Format response
            if llm_response:
                # LLM successfully generated response
                source = "groq" if self.llm_provider.groq_client else "gemini"
                logger.info(f"✓ Generated response using {source}")
                
                return {
                    "message": llm_response,
                    "recommendations": matched_listings,
                    "source": source,
                    "success": True
                }
            else:
                # Both LLMs failed - use deterministic fallback
                logger.warning("⚠️  LLM providers failed, using deterministic fallback")
                fallback_message = self._generate_fallback_message(matched_listings)
                
                return {
                    "message": fallback_message,
                    "recommendations": matched_listings,
                    "source": "fallback",
                    "success": True
                }
                
        except Exception as e:
            logger.error(f"❌ Error generating response: {e}")
            return {
                "message": "I'm having trouble processing your request right now. Please try again.",
                "recommendations": [],
                "source": "error",
                "success": False,
                "error": str(e)
            }
    
    def _build_prompt(
        self,
        user_interests: List[str],
        user_query: str,
        matched_listings: List[Dict[str, Any]],
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Build structured prompt for LLM"""
        
        # Format user interests
        interests_str = ", ".join(user_interests) if user_interests else "exploring Sri Lanka"
        
        # Format matched experiences
        experiences = []
        for i, listing in enumerate(matched_listings[:3], 1):
            title = listing.get("title", "Experience")
            location = listing.get("location", "Sri Lanka")
            experiences.append(f"{i}. {title} - {location}")
        
        experiences_str = "\n".join(experiences) if experiences else "Various exciting experiences across Sri Lanka"
        
        # Build prompt
        prompt = f"""You are a friendly AI travel concierge for Sri Lanka.

User interests: {interests_str}
User query: {user_query}

Top matched experiences:
{experiences_str}

Write a natural, friendly, inspiring response in under 120 words.
Encourage discovery and highlight why these experiences are special.
Do NOT mention booking or pricing.
Use light emojis sparingly (max 2-3).
Sound conversational and warm, like talking to a friend."""

        return prompt
    
    def _generate_fallback_message(self, matched_listings: List[Dict[str, Any]]) -> str:
        """Generate deterministic fallback message when LLMs fail"""
        
        if not matched_listings:
            return "I'd love to help you discover Sri Lanka! Could you tell me more about what you're interested in? 🌴"
        
        num_listings = len(matched_listings)
        
        # Simple deterministic message
        messages = [
            f"Based on your interests, I found {num_listings} experience{'s' if num_listings != 1 else ''} you might enjoy in Sri Lanka.",
            "These destinations match your preferences and offer unique experiences.",
            "Explore the details to learn more about each one! 🌴"
        ]
        
        return " ".join(messages)
    
    async def _get_user_liked_items(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's liked/saved items"""
        try:
            # Try to get from Firestore
            # Assuming there's a 'user_likes' or similar collection
            # If not, return empty list
            
            # For now, return empty list
            # TODO: Implement proper liked items fetching when schema is defined
            return []
            
        except Exception as e:
            logger.warning(f"Could not fetch liked items: {e}")
            return []
    
    def _parse_query_to_filters(self, query: str, user_prefs: dict) -> SearchFilters:
        """
        Parse natural language query to extract search filters
        
        Examples:
        - "hotels in Galle" → location='Galle', category='Accommodation'
        - "beach experiences under $100" → tags=['beach'], max_price=100
        - "tours in Colombo" → location='Colombo', category='Tour'
        
        Args:
            query: Natural language query
            user_prefs: User preferences dict
            
        Returns:
            SearchFilters object
        """
        query_lower = query.lower()
        
        # Extract location (common Sri Lankan cities)
        locations = ["galle", "colombo", "kandy", "ella", "sigiriya", "anuradhapura", 
                    "trincomalee", "jaffna", "negombo", "bentota", "mirissa", "arugam bay"]
        location = None
        for loc in locations:
            if loc in query_lower:
                location = loc.title()
                break
        
        # Extract category
        category = None
        if any(word in query_lower for word in ["hotel", "accommodation", "stay", "resort", "villa"]):
            category = "Accommodation"
        elif any(word in query_lower for word in ["tour", "guide", "trip", "excursion"]):
            category = "Tour"
        elif any(word in query_lower for word in ["restaurant", "food", "dining", "cafe"]):
            category = "Restaurant"
        elif any(word in query_lower for word in ["activity", "experience", "adventure"]):
            category = "Activity"
        
        # Extract price (look for "under $X" or "below $X")
        max_price = None
        import re
        price_match = re.search(r'(?:under|below|less than)\s+\$?(\d+)', query_lower)
        if price_match:
            max_price = float(price_match.group(1))
        
        # Extract tags/keywords
        tags = []
        tag_keywords = {
            "beach": ["beach", "ocean", "seaside", "coastal"],
            "luxury": ["luxury", "premium", "5-star", "deluxe"],
            "budget": ["budget", "cheap", "affordable", "economical"],
            "family": ["family", "kids", "children"],
            "adventure": ["adventure", "hiking", "trekking", "climbing"],
            "cultural": ["cultural", "heritage", "temple", "historical"],
            "wildlife": ["wildlife", "safari", "animals", "nature"],
        }
        
        for tag, keywords in tag_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                tags.append(tag)
        
        # Create filters
        return SearchFilters(
            location=location,
            category=category,
            max_price=max_price,
            tags=tags if tags else None,
            available_only=True  # Always filter for available listings
        )


# Global singleton instance
_travel_assistant = None

def get_travel_assistant(data_repository: Optional[DataRepository] = None) -> TravelAssistantService:
    """
    Get or create singleton travel assistant instance
    
    Args:
        data_repository: Optional repository for real-time data access
    """
    global _travel_assistant
    if _travel_assistant is None:
        _travel_assistant = TravelAssistantService(data_repository=data_repository)
    return _travel_assistant
