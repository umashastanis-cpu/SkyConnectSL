"""
Itinerary Planning Tools
Tools for creating travel itineraries and calculating distances
"""

from typing import Optional, List, Dict, Any
from langchain.tools import BaseTool
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import math


# Tool Input Schemas
class CreateItineraryInput(BaseModel):
    """Input for CreateItinerary tool"""
    destinations: List[str] = Field(description="List of destinations/cities to visit")
    days: int = Field(description="Number of days for the trip")
    interests: Optional[List[str]] = Field(None, description="User interests: beach, culture, adventure, wildlife, etc.")
    budget_per_day: Optional[float] = Field(None, description="Daily budget in USD")


class CalculateDistanceInput(BaseModel):
    """Input for CalculateDistance tool"""
    from_location: str = Field(description="Starting location/city")
    to_location: str = Field(description="Destination location/city")


class GetLocalTipsInput(BaseModel):
    """Input for GetLocalTips tool"""
    location: str = Field(description="City or region in Sri Lanka")
    category: Optional[str] = Field(None, description="food, transport, safety, culture, or general")


# Distance database (approximate distances between major Sri Lankan cities in km)
DISTANCE_DATABASE = {
    ('Colombo', 'Kandy'): 115,
    ('Colombo', 'Galle'): 120,
    ('Colombo', 'Ella'): 230,
    ('Colombo', 'Nuwara Eliya'): 180,
    ('Colombo', 'Jaffna'): 400,
    ('Colombo', 'Trincomalee'): 260,
    ('Colombo', 'Sigiriya'): 170,
    ('Colombo', 'Anuradhapura'): 205,
    ('Kandy', 'Ella'): 130,
    ('Kandy', 'Nuwara Eliya'): 80,
    ('Kandy', 'Sigiriya'): 85,
    ('Galle', 'Ella'): 170,
    ('Galle', 'Mirissa'): 25,
    ('Galle', 'Unawatuna'): 8,
    ('Ella', 'Nuwara Eliya'): 60,
    ('Nuwara Eliya', 'Horton Plains'): 35,
    ('Sigiriya', 'Dambulla'): 20,
    ('Sigiriya', 'Polonnaruwa'): 70,
}

# Local tips database
LOCAL_TIPS_DATABASE = {
    'Colombo': {
        'food': "Try kottu roti at Navinna or Galle Face Green. Best seafood at Ministry of Crab.",
        'transport': "Use PickMe or Uber. Tuk-tuks are fun but negotiate price first. Train to Kandy is scenic!",
        'safety': "Generally safe. Watch belongings in crowded markets. Avoid unlicensed taxis at night.",
        'culture': "Dress modestly at temples. Remove shoes before entering. Tip 10% at restaurants.",
        'general': "Colombo is hot & humid year-round. Stay hydrated. Galle Face Green is perfect for sunset."
    },
    'Kandy': {
        'food': "Try wood-fired pizza at Slightly Chilled. Traditional rice & curry at Balaji Dosai.",
        'transport': "City is walkable but hilly. Tuk-tuks everywhere. Train from Colombo is beautiful!",
        'safety': "Very safe. Watch for monkeys at Temple of the Tooth - don't feed them!",
        'culture': "Temple of the Tooth dress code: cover knees & shoulders. Evening cultural dance show is worth it.",
        'general': "Cooler than Colombo. Visit lake in evening. July/August Esala Perahera festival is spectacular."
    },
    'Ella': {
        'food': "Café Chill for views, Matey Hut for rice & curry, Ella Jungle Resort for western food.",
        'transport': "Walkable town. Rent a tuk-tuk for day trips. Train from Kandy is MUST-DO (book in advance).",
        'safety': "Super safe & tourist-friendly. Easy hikes: Little Adam's Peak (45min), Ella Rock (3hrs).",
        'culture': "Backpacker hub - very relaxed vibe. Nine Arch Bridge best at 6am or 4pm for trains.",
        'general': "Cool climate perfect for hiking. Book trains EARLY (sells out weeks ahead)."
    },
    'Galle': {
        'food': "Galle Fort has great cafés: Poonie's Kitchen, Pedlar's Inn. Fresh crab curry everywhere!",
        'transport': "Fort is walkable. Buses to Unawatuna (20min). Tuk-tuk to beaches ($3-5).",
        'safety': "Very safe. Watch for big waves at beaches - riptides can be strong.",
        'culture': "Galle Fort is UNESCO site - mix of Dutch & Portuguese architecture. Sunset walk on fort walls!",
        'general': "Best Nov-Apr (calm seas). May-Oct monsoon but still beautiful. Unawatuna beach 15min away."
    },
    'Nuwara Eliya': {
        'food': "Grand Hotel for high tea, Milano for pizza, local market for fresh strawberries!",
        'transport': "Town is walkable but hilly. Hire tuk-tuk for tea plantation tours ($15-20/day).",
        'safety': "Cold at night (10-15°C) - bring layers! Fog can be thick in morning.",
        'culture': "Called 'Little England' - British colonial architecture. Visit Pedro Tea Estate for free tour.",
        'general': "Best Apr-Aug. Horton Plains trek starts 6am (Book at park 5:30am). Gregory Lake nice for evening walk."
    },
}


# Custom Tools
class CreateItineraryTool(BaseTool):
    """Tool for creating basic travel itineraries"""
    name: str = "CreateItinerary"
    description: str = """Create a day-by-day travel itinerary for Sri Lanka based on destinations, duration, and interests.
    Use this when travelers ask for trip planning, multi-day recommendations, or "what should I do in X days".
    """
    args_schema: type = CreateItineraryInput
    
    def _run(self, destinations: List[str], days: int, interests: Optional[List[str]] = None, budget_per_day: Optional[float] = None) -> str:
        """Create a simple itinerary"""
        try:
            if days > 14:
                return "I can plan itineraries up to 14 days. For longer trips, break them into 2-week segments!"
            
            if not destinations:
                return "Please provide at least one destination to create an itinerary."
            
            # Build itinerary header
            itinerary = f"**{days}-Day Sri Lanka Itinerary**\n\n"
            itinerary += f"**Destinations:** {', '.join(destinations)}\n"
            
            if interests:
                itinerary += f"**Focus:** {', '.join(interests)}\n"
            if budget_per_day:
                itinerary += f"**Budget:** ${budget_per_day}/day\n"
            
            itinerary += "\n---\n\n"
            
            # Distribute days across destinations
            days_per_destination = max(1, days // len(destinations))
            current_day = 1
            
            for idx, dest in enumerate(destinations):
                # Allocate days
                if idx == len(destinations) - 1:
                    # Last destination gets remaining days
                    allocated_days = days - current_day + 1
                else:
                    allocated_days = min(days_per_destination, days - current_day + 1)
                
                # Create daily entries
                for day_offset in range(allocated_days):
                    day_num = current_day + day_offset
                    itinerary += f"**Day {day_num}: {dest}**\n"
                    
                    if day_offset == 0:
                        itinerary += f"• Arrive in {dest}\n"
                        itinerary += f"• Explore downtown area\n"
                    else:
                        itinerary += f"• Full day in {dest}\n"
                    
                    # Add interest-based activities
                    if interests:
                        if 'beach' in [i.lower() for i in interests] and dest.lower() in ['galle', 'mirissa', 'trincomalee']:
                            itinerary += "• Beach time & water activities\n"
                        if 'culture' in [i.lower() for i in interests] and dest.lower() in ['kandy', 'anuradhapura', 'sigiriya']:
                            itinerary += "• Visit temples and cultural sites\n"
                        if 'adventure' in [i.lower() for i in interests] and dest.lower() in ['ella', 'nuwara eliya']:
                            itinerary += "• Hiking and outdoor adventure\n"
                    
                    itinerary += "\n"
                
                current_day += allocated_days
            
            # Add budget estimate
            if budget_per_day:
                total_budget = budget_per_day * days
                itinerary += f"**Estimated Total Cost:** ${total_budget:.0f}\n\n"
            
            # Add helpful note
            itinerary += "*💡 Tip: Book train tickets 30 days in advance for best views! Contact me for specific activity recommendations at each destination.*"
            
            return itinerary
            
        except Exception as e:
            return f"Error creating itinerary: {str(e)}"
    
    async def _arun(self, *args, **kwargs):
        """Async version"""
        return self._run(*args, **kwargs)


class CalculateDistanceTool(BaseTool):
    """Tool for calculating distances between Sri Lankan cities"""
    name: str = "CalculateDistance"
    description: str = """Calculate distance between two locations in Sri Lanka and estimate travel time.
    Use this when travelers ask "how far is X from Y" or "how long to get from X to Y".
    """
    args_schema: type = CalculateDistanceInput
    
    def _run(self, from_location: str, to_location: str) -> str:
        """Calculate distance and travel time"""
        try:
            # Normalize location names
            from_loc = from_location.strip().title()
            to_loc = to_location.strip().title()
            
            # Check both orderings in database
            distance_km = None
            if (from_loc, to_loc) in DISTANCE_DATABASE:
                distance_km = DISTANCE_DATABASE[(from_loc, to_loc)]
            elif (to_loc, from_loc) in DISTANCE_DATABASE:
                distance_km = DISTANCE_DATABASE[(to_loc, from_loc)]
            
            if distance_km is None:
                return f"I don't have distance data for {from_loc} to {to_loc}. These are popular routes I know: {', '.join([f'{a}-{b}' for a,b in list(DISTANCE_DATABASE.keys())[:10]])}"
            
            # Calculate travel time estimates
            # Sri Lanka average speeds: Car 40km/h, Train 30km/h, Bus 35km/h
            car_hours = distance_km / 40
            train_hours = distance_km / 30
            bus_hours = distance_km / 35
            
            def format_time(hours):
                if hours < 1:
                    return f"{int(hours * 60)}min"
                else:
                    h = int(hours)
                    m = int((hours - h) * 60)
                    return f"{h}h {m}min" if m > 0 else f"{h}h"
            
            result = f"""
**Distance: {from_loc} → {to_loc}**

📍 Distance: {distance_km} km ({distance_km * 0.621:.0f} miles)

⏱️ **Estimated Travel Times:**
• 🚗 By Car/Taxi: {format_time(car_hours)}
• 🚂 By Train: {format_time(train_hours)} (scenic!)
• 🚌 By Bus: {format_time(bus_hours)} (budget option)
• 🛺 By Tuk-tuk: Not recommended for long distances

💡 **Recommendation:** {"Book the train - it's scenic and comfortable!" if distance_km > 50 else "Tuk-tuk or taxi is perfect for this short distance."}
            """
            
            return result.strip()
            
        except Exception as e:
            return f"Error calculating distance: {str(e)}"
    
    async def _arun(self, *args, **kwargs):
        """Async version"""
        return self._run(*args, **kwargs)


class GetLocalTipsTool(BaseTool):
    """Tool for getting local tips and advice"""
    name: str = "GetLocalTips"
    description: str = """Get local insider tips for a specific location in Sri Lanka - food, transport, safety, culture.
    Use when travelers ask "what should I know about X" or "any tips for Y" or "is X safe".
    """
    args_schema: type = GetLocalTipsInput
    
    def _run(self, location: str, category: Optional[str] = None) -> str:
        """Get local tips for a location"""
        try:
            loc = location.strip().title()
            
            if loc not in LOCAL_TIPS_DATABASE:
                available = ', '.join(LOCAL_TIPS_DATABASE.keys())
                return f"I have detailed tips for: {available}. Ask about any of these destinations!"
            
            tips = LOCAL_TIPS_DATABASE[loc]
            
            # Return specific category or all tips
            if category and category.lower() in tips:
                return f"**{category.title()} Tips for {loc}:**\n{tips[category.lower()]}"
            else:
                result = f"**Local Tips for {loc}:**\n\n"
                result += f"🍽️ **Food:** {tips['food']}\n\n"
                result += f"🚕 **Transport:** {tips['transport']}\n\n"
                result += f"🛡️ **Safety:** {tips['safety']}\n\n"
                result += f"🏛️ **Culture:** {tips['culture']}\n\n"
                result += f"ℹ️ **General:** {tips['general']}"
                return result
            
        except Exception as e:
            return f"Error getting local tips: {str(e)}"
    
    async def _arun(self, *args, **kwargs):
        """Async version"""
        return self._run(*args, **kwargs)


def get_itinerary_tools() -> List[BaseTool]:
    """Get all itinerary planning tools"""
    return [
        CreateItineraryTool(),
        CalculateDistanceTool(),
        GetLocalTipsTool()
    ]
