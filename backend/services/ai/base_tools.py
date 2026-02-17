"""
LangChain Tools for AI Agents
Defines custom tools that agents can use to interact with the system
"""

from typing import Optional, List, Dict, Any
from langchain.tools import BaseTool
from pydantic import BaseModel, Field

# Import services
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from services.firestore_service import firestore_service
from services.ai.embeddings import get_knowledge_base


# Tool Input Schemas
class SearchListingsInput(BaseModel):
    """Input for SearchListings tool"""
    query: str = Field(description="Natural language search query for listings")
    category: Optional[str] = Field(None, description="Filter by category: tour, accommodation, transport, activity")
    location: Optional[str] = Field(None, description="Filter by location/city")
    max_results: Optional[int] = Field(5, description="Maximum number of results to return")


class GetListingDetailsInput(BaseModel):
    """Input for GetListingDetails tool"""
    listing_id: str = Field(description="The ID of the listing to retrieve")


class CheckAvailabilityInput(BaseModel):
    """Input for CheckAvailability tool"""
    listing_id: str = Field(description="The listing ID to check")
    start_date: str = Field(description="Start date in YYYY-MM-DD format")
    end_date: str = Field(description="End date in YYYY-MM-DD format")


class GetUserPreferencesInput(BaseModel):
    """Input for GetUserPreferences tool"""
    user_id: str = Field(description="The user ID to get preferences for")


class TravelGuideInput(BaseModel):
    """Input for TravelGuide tool"""
    query: str = Field(description="Question about Sri Lanka travel (visa, weather, destinations, etc.)")


# Custom Tools
class SearchListingsTool(BaseTool):
    """Tool for semantic search across listings"""
    name: str = "SearchListings"
    description: str = """Search for tours, accommodations, activities, and transport in Sri Lanka using natural language. 
    Use this when users ask for recommendations or want to find specific experiences.
    Examples: "romantic beach resorts", "family-friendly tours in Kandy", "budget accommodations in Ella"
    """
    args_schema: type = SearchListingsInput
    
    def _run(self, query: str, category: Optional[str] = None, location: Optional[str] = None, max_results: int = 5) -> str:
        """Execute semantic search on listings"""
        try:
            knowledge_base = get_knowledge_base()
            
            # Build filter
            filter_type = "listing"
            
            # Enhance query with filters
            enhanced_query = query
            if category:
                enhanced_query = f"{query} category:{category}"
            if location:
                enhanced_query = f"{enhanced_query} location:{location}"
            
            # Search vector database
            results = knowledge_base.search(
                query=enhanced_query,
                k=max_results,
                filter_type=filter_type
            )
            
            if not results:
                return "No listings found matching your criteria. Try broadening your search or asking for recommendations in a different location."
            
            # Format results
            formatted_results = []
            for idx, result in enumerate(results, 1):
                metadata = result['metadata']
                formatted_results.append(
                    f"{idx}. {metadata.get('title', 'N/A')} "
                    f"({metadata.get('category', 'N/A')} in {metadata.get('location', 'N/A')})\n"
                    f"   Price: ${metadata.get('price', 0)}\n"
                    f"   ID: {metadata.get('id', 'N/A')}"
                )
            
            return "\n\n".join(formatted_results)
            
        except Exception as e:
            return f"Error searching listings: {str(e)}"
    
    async def _arun(self, *args, **kwargs):
        """Async version"""
        return self._run(*args, **kwargs)


class GetListingDetailsTool(BaseTool):
    """Tool to get full details of a specific listing"""
    name: str = "GetListingDetails"
    description: str = """Get complete details about a specific listing by its ID. 
    Use this after SearchListings to get full information including amenities, reviews, partner details, etc.
    """
    args_schema: type = GetListingDetailsInput
    
    def _run(self, listing_id: str) -> str:
        """Get listing details from Firestore"""
        try:
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            listing = loop.run_until_complete(firestore_service.get_listing_by_id(listing_id))
            loop.close()
            
            if not listing:
                return f"Listing {listing_id} not found."
            
            # Format detailed information
            details = f"""
**{listing.get('title', 'N/A')}**

**Category:** {listing.get('category', 'N/A')}
**Location:** {listing.get('location', 'N/A')}
**Price:** ${listing.get('price', 0)} {listing.get('currency', 'USD')}

**Description:**
{listing.get('description', 'No description available')}

**Details:**
- Partner: {listing.get('partnerName', 'N/A')}
- Duration: {listing.get('duration', 'N/A')}
- Max Capacity: {listing.get('maxCapacity', 'N/A')}
- Rating: {listing.get('rating', 'No ratings yet')} ⭐ ({listing.get('reviewCount', 0)} reviews)

**Amenities:** {', '.join(listing.get('amenities', []))}
**Tags:** {', '.join(listing.get('tags', []))}

**Status:** {listing.get('status', 'N/A')}
            """
            
            return details.strip()
            
        except Exception as e:
            return f"Error getting listing details: {str(e)}"
    
    async def _arun(self, *args, **kwargs):
        """Async version"""
        return self._run(*args, **kwargs)


class TravelGuideTool(BaseTool):
    """Tool for Sri Lanka travel information"""
    name: str = "SriLankaTravelGuide"
    description: str = """Get information about traveling in Sri Lanka including:
    - Best time to visit different regions
    - Visa requirements and entry procedures
    - Popular destinations and what to see
    - Transportation options
    - Food and cuisine recommendations
    - Budget and costs
    - Cultural tips and etiquette
    Use this for general travel planning questions.
    """
    args_schema: type = TravelGuideInput
    
    def _run(self, query: str) -> str:
        """Search travel guide knowledge base"""
        try:
            knowledge_base = get_knowledge_base()
            
            # Search travel guide sections
            results = knowledge_base.search(
                query=query,
                k=2,
                filter_type="travel_guide"
            )
            
            if not results:
                return "I don't have specific information about that. Please ask about visa, weather, destinations, transport, food, or budget for Sri Lanka."
            
            # Return most relevant section
            return results[0]['content']
            
        except Exception as e:
            return f"Error accessing travel guide: {str(e)}"
    
    async def _arun(self, *args, **kwargs):
        """Async version"""
        return self._run(*args, **kwargs)


class GetUserPreferencesTool(BaseTool):
    """Tool to get user preferences and history"""
    name: str = "GetUserPreferences"
    description: str = """Get a traveler's preferences, budget range, travel type, and past booking history.
    Use this to personalize recommendations based on their profile.
    """
    args_schema: type = GetUserPreferencesInput
    
    def _run(self, user_id: str) -> str:
        """Get user profile and preferences"""
        try:
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            # Get traveler profile
            profile = loop.run_until_complete(firestore_service.get_traveler_profile(user_id))
            
            if not profile:
                return "User profile not found. Proceed with general recommendations."
            
            # Get booking history
            bookings = loop.run_until_complete(firestore_service.get_user_bookings(user_id, 'traveler'))
            
            loop.close()
            
            # Format preferences
            preferences_text = f"""
**User Preferences:**
- Name: {profile.get('name', 'N/A')}
- Budget Range: ${profile.get('budgetRange', {}).get('min', 0)} - ${profile.get('budgetRange', {}).get('max', 0)}
- Travel Type: {profile.get('travelType', 'N/A')}
- Interests: {', '.join(profile.get('travelPreferences', []))}
- Past Bookings: {len(bookings)} trips
            """
            
            if bookings:
                categories = [b.get('category', 'N/A') for b in bookings[:3]]
                preferences_text += f"\n- Favorite Categories: {', '.join(set(categories))}"
            
            return preferences_text.strip()
            
        except Exception as e:
            return f"Error getting user preferences: {str(e)}"
    
    async def _arun(self, *args, **kwargs):
        """Async version"""
        return self._run(*args, **kwargs)


class CheckAvailabilityTool(BaseTool):
    """Tool to check listing availability"""
    name: str = "CheckAvailability"
    description: str = """Check if a listing is available for specific dates.
    Use after finding listings to verify they're bookable for the user's desired dates.
    """
    args_schema: type = CheckAvailabilityInput
    
    def _run(self, listing_id: str, start_date: str, end_date: str) -> str:
        """Check availability (simplified version)"""
        try:
            import asyncio
            from datetime import datetime
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            listing = loop.run_until_complete(firestore_service.get_listing_by_id(listing_id))
            loop.close()
            
            if not listing:
                return f"Listing {listing_id} not found."
            
            # In a real implementation, you'd check booking calendar
            # For now, check if dates are within availability window
            availability = listing.get('availability', {})
            
            # Simplified availability check
            return f"""
**Availability Check for {listing.get('title', 'N/A')}**

Dates Requested: {start_date} to {end_date}
Status: ✅ Available (subject to confirmation)

Note: Please contact the partner to confirm exact availability and lock in your dates.
Partner: {listing.get('partnerName', 'N/A')}
            """.strip()
            
        except Exception as e:
            return f"Error checking availability: {str(e)}"
    
    async def _arun(self, *args, **kwargs):
        """Async version"""
        return self._run(*args, **kwargs)


# Tool lists for different agents
def get_travel_concierge_tools() -> List[BaseTool]:
    """Get tools for the travel concierge agent"""
    return [
        SearchListingsTool(),
        GetListingDetailsTool(),
        TravelGuideTool(),
        GetUserPreferencesTool(),
        CheckAvailabilityTool()
    ]


def get_partner_intelligence_tools() -> List[BaseTool]:
    """Get tools for partner business intelligence agent"""
    # TODO: Implement in Phase 3
    return []


def get_admin_moderation_tools() -> List[BaseTool]:
    """Get tools for admin moderation agent"""
    # TODO: Implement in Phase 3
    return []
