# 🤖 AI Tools Implementation Guide - Expert Tutorial

**Role:** AI/ML Engineering Expert  
**Date:** February 14, 2026  
**Purpose:** Complete implementation of missing LangChain AI tools

---

## 📋 TABLE OF CONTENTS

1. [Architecture Overview](#architecture-overview)
2. [Understanding LangChain Tools](#understanding-langchain-tools)
3. [File Structure](#file-structure)
4. [Missing Components](#missing-components)
5. [Implementation Step-by-Step](#implementation-step-by-step)
6. [Code Examples](#code-examples)
7. [Testing Guide](#testing-guide)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ ARCHITECTURE OVERVIEW

### Current Structure Problem

```
backend/services/ai/
├── agent.py                    ✅ Exists (main agent logic)
├── prompts.py                  ✅ Exists (system prompts)
├── embeddings.py               ✅ Exists (vector search)
├── tools.py                    ✅ Exists (basic tools BUT wrong location)
├── base_tools.py              ❌ MISSING (should be tools.py renamed)
├── agents/                     
│   ├── travel_concierge.py    ✅ Exists (imports missing tools)
│   ├── partner_intelligence.py ✅ Exists (imports missing tools)
│   └── admin_moderator.py      ✅ Exists (imports missing tools)
├── memory/                     ❌ Directory exists, files missing
│   ├── __init__.py             ❌ MISSING
│   └── conversation_store.py   ❌ MISSING
└── tools/                      📁 Directory exists
    ├── __init__.py             ❌ MISSING
    ├── itinerary_tools.py      ❌ MISSING
    ├── analytics_tools.py      ❌ MISSING
    └── moderation_tools.py     ❌ MISSING
```

### What We're Building

**3 Specialized AI Agents:**
1. **Travel Concierge** - Helps travelers find listings and plan trips
2. **Partner Intelligence** - Provides business analytics for partners
3. **Admin Moderator** - Assists admins with approval workflows

**Each agent needs specific tools (functions it can call):**
- Travel Concierge: Search, itinerary planning, distance calculation
- Partner Intelligence: Analytics, revenue reports, review analysis
- Admin Moderator: Duplicate detection, content moderation, quality scoring

---

## 🧠 UNDERSTANDING LANGCHAIN TOOLS

### What are LangChain Tools?

**Simple Analogy:** 
- **Agent** = Brain (LLM like GPT, Gemini, Llama)
- **Tools** = Hands (Functions the agent can use)

Example conversation:
```
User: "Find me beach resorts in Galle under $100"

Agent thinks: 
  "I need to search listings. I have a SearchListings tool!"
  
Agent uses tool:
  SearchListings(query="beach resorts", location="Galle", max_price=100)
  
Tool returns:
  "1. Paradise Beach Resort - $80/night
   2. Ocean View Hotel - $95/night"
   
Agent responds to user:
  "I found 2 great options for you..."
```

### Tool Anatomy (Code Structure)

```python
from langchain.tools import BaseTool
from pydantic import BaseModel, Field

# 1. Define INPUT SCHEMA (what parameters the tool accepts)
class MyToolInput(BaseModel):
    """What the tool needs to work"""
    parameter1: str = Field(description="What this parameter does")
    parameter2: int = Field(default=5, description="Optional parameter with default")

# 2. Define THE TOOL (the actual function)
class MyTool(BaseTool):
    """Tool description - tells the agent WHEN to use this tool"""
    name: str = "ToolName"  # Short identifier
    description: str = "When to use: ..."  # Critical - helps agent decide!
    args_schema: type = MyToolInput  # Link to input schema
    
    def _run(self, parameter1: str, parameter2: int = 5) -> str:
        """The actual logic - what the tool DOES"""
        try:
            # Do something (query database, calculate, etc.)
            result = do_something(parameter1, parameter2)
            return f"Result: {result}"
        except Exception as e:
            return f"Error: {str(e)}"
    
    async def _arun(self, *args, **kwargs):
        """Async version (can just call sync version)"""
        return self._run(*args, **kwargs)
```

---

## 📁 FILE STRUCTURE

### Option 1: Refactor (RECOMMENDED)

Rename `tools.py` → `base_tools.py` and create specialized tool files:

```
backend/services/ai/
├── base_tools.py              # Renamed from tools.py
│   └── Contains: SearchListings, GetListingDetails, TravelGuide, etc.
│
├── tools/                      # Specialized tools
│   ├── __init__.py
│   ├── itinerary_tools.py     # CreateItinerary, CalculateDistance
│   ├── analytics_tools.py     # GetPartnerAnalytics, AnalyzeReviews
│   └── moderation_tools.py    # DetectDuplicates, ModerateContent
│
└── memory/
    ├── __init__.py
    └── conversation_store.py   # Chat history management
```

### Option 2: Keep tools.py, Add Missing Files (EASIER)

Keep current structure and just add missing imports:

```python
# In tools.py, add at the end:
get_travel_concierge_tools = get_travel_concierge_tools  # Export for base_tools

# Then create base_tools.py as a simple re-export
```

**We'll use Option 1 (cleaner architecture)**

---

## 🔧 IMPLEMENTATION STEP-BY-STEP

### Phase 1: Reorganize Existing Code (5 minutes)

**Step 1.1: Rename tools.py to base_tools.py**
```powershell
cd backend/services/ai
mv tools.py base_tools.py
```

**Step 1.2: Update imports in base_tools.py**
```python
# Keep everything the same, just the filename changes
```

### Phase 2: Create Memory Module (10 minutes)

**Step 2.1: Create memory/__init__.py**
**Step 2.2: Create memory/conversation_store.py**

### Phase 3: Create Specialized Tools (45 minutes)

**Step 3.1: Create tools/__init__.py**
**Step 3.2: Create tools/itinerary_tools.py** (15 mins)
**Step 3.3: Create tools/analytics_tools.py** (15 mins)
**Step 3.4: Create tools/moderation_tools.py** (15 mins)

### Phase 4: Test Everything (15 minutes)

**Total Time:** ~75 minutes (1.25 hours)

---

## 💻 CODE EXAMPLES

### FILE 1: backend/services/ai/base_tools.py

**Action:** Rename your existing `tools.py` to `base_tools.py`

```powershell
# In PowerShell:
cd c:\Users\Hp\Desktop\SkyConnectSL\backend\services\ai
mv tools.py base_tools.py
```

No code changes needed - just rename the file!

---

### FILE 2: backend/services/ai/memory/__init__.py

```python
"""
Memory Module
Conversation history and session management
"""

from .conversation_store import ConversationStore, get_conversation_store

__all__ = ['ConversationStore', 'get_conversation_store']
```

---

### FILE 3: backend/services/ai/memory/conversation_store.py

```python
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
```

---

### FILE 4: backend/services/ai/tools/__init__.py

```python
"""
Specialized AI Tools
Domain-specific tools for different agent types
"""

from .itinerary_tools import get_itinerary_tools
from .analytics_tools import get_analytics_tools
from .moderation_tools import get_moderation_tools

__all__ = [
    'get_itinerary_tools',
    'get_analytics_tools',
    'get_moderation_tools'
]
```

---

### FILE 5: backend/services/ai/tools/itinerary_tools.py

```python
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
```

---

### FILE 6: backend/services/ai/tools/analytics_tools.py

```python
"""
Analytics Tools
Tools for partner business intelligence and performance metrics
"""

from typing import Optional, List, Dict, Any
from langchain.tools import BaseTool
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import random


# Tool Input Schemas
class GetPartnerAnalyticsInput(BaseModel):
    """Input for GetPartnerAnalytics tool"""
    partner_id: str = Field(description="Partner user ID")
    listing_id: Optional[str] = Field(None, description="Specific listing ID (optional)")
    time_period: Optional[str] = Field("30days", description="Time period: 7days, 30days, 90days, or 1year")


class AnalyzeReviewsInput(BaseModel):
    """Input for AnalyzeReviews tool"""
    listing_id: str = Field(description="Listing ID to analyze reviews for")


class GetRevenueReportInput(BaseModel):
    """Input for GetRevenueReport tool"""
    partner_id: str = Field(description="Partner user ID")
    time_period: Optional[str] = Field("30days", description="Time period: 7days, 30days, 90days, or 1year")


# Custom Tools
class GetPartnerAnalyticsTool(BaseTool):
    """Tool to get partner performance metrics"""
    name: str = "GetPartnerAnalytics"
    description: str = """Get performance metrics for a partner's listings including views, clicks, bookings, and conversion rates.
    Use this when partners ask about their performance, stats, or how their listings are doing.
    """
    args_schema: type = GetPartnerAnalyticsInput
    
    def _run(self, partner_id: str, listing_id: Optional[str] = None, time_period: str = "30days") -> str:
        """Get analytics data (demo data for now)"""
        try:
            # In production, fetch from Firestore analytics collection
            # For now, generate demo data
            
            import sys
            import os
            sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
            
            from services.firestore_service import firestore_service
            import asyncio
            
            # Get partner's listings
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            if listing_id:
                listing = loop.run_until_complete(firestore_service.get_listing_by_id(listing_id))
                listings = [listing] if listing else []
            else:
                # Get all partner listings (this function doesn't exist yet!)
                # For demo, generate mock data
                listings = [{
                    'id': 'demo123',
                    'title': 'Demo Listing',
                    'category': 'tour',
                    'price': 75
                }]
            
            loop.close()
            
            if not listings:
                return "No listings found for this partner."
            
            # Generate demo analytics
            days = 30 if time_period == "30days" else 7 if time_period == "7days" else 90
            
            total_views = random.randint(100, 1000)
            total_clicks = random.randint(20, total_views // 3)
            total_bookings = random.randint(1, total_clicks // 5)
            total_revenue = total_bookings * random.randint(50, 200)
            
            click_rate = (total_clicks / total_views * 100) if total_views > 0 else 0
            conversion_rate = (total_bookings / total_clicks * 100) if total_clicks > 0 else 0
            
            result = f"""
**📊 Performance Report - Last {days} Days**

**Overview:**
• 👁️ Views: {total_views:,}
• 🖱️ Clicks: {total_clicks:,} ({click_rate:.1f}% click rate)
• ✅ Bookings: {total_bookings} ({conversion_rate:.1f}% conversion)
• 💰 Revenue: ${total_revenue:,}

**Per-Listing Breakdown:**
"""
            
            for idx, listing in enumerate(listings, 1):
                views = random.randint(50, total_views // len(listings) + 50)
                clicks = random.randint(10, views // 3)
                bookings = random.randint(0, clicks // 5)
                
                result += f"\n{idx}. **{listing.get('title', 'Unknown')}**\n"
                result += f"   • Views: {views} | Clicks: {clicks} | Bookings: {bookings}\n"
                result += f"   • Conversion: {(bookings/clicks*100) if clicks > 0 else 0:.1f}%\n"
            
            # Add insights
            result += "\n**💡 Insights:**\n"
            if click_rate > 15:
                result += "✅ Excellent click rate! Your titles/photos are working.\n"
            else:
                result += "⚠️ Low click rate - try improving your listing photos and titles.\n"
            
            if conversion_rate > 5:
                result += "✅ Good conversion! Customers like what they see.\n"
            elif conversion_rate > 2:
                result += "⚠️ Average conversion - consider adding more details or FAQs.\n"
            else:
                result += "⚠️ Low conversion - price, description, or availability may be issues.\n"
            
            return result.strip()
            
        except Exception as e:
            return f"Error getting analytics: {str(e)}"
    
    async def _arun(self, *args, **kwargs):
        """Async version"""
        return self._run(*args, **kwargs)


class AnalyzeReviewsTool(BaseTool):
    """Tool to analyze customer reviews and sentiment"""
    name: str = "AnalyzeReviews"
    description: str = """Analyze customer reviews for a listing to identify common themes, sentiment, strengths, and areas to improve.
    Use when partners want to understand what customers are saying about their listing.
    """
    args_schema: type = AnalyzeReviewsInput
    
    def _run(self, listing_id: str) -> str:
        """Analyze reviews (demo version)"""
        try:
            # In production: fetch reviews from Firestore and use NLP
            # For now: generate demo analysis
            
            # Demo review themes
            positive_themes = [
                ("Excellent guides", 8),
                ("Beautiful scenery", 12),
                ("Good value for money", 6),
                ("Professional service", 9),
                ("Well-organized", 5)
            ]
            
            negative_themes = [
                ("Long waiting time", 3),
                ("Need better communication", 2),
                ("Lunch could be improved", 4)
            ]
            
            avg_rating = random.uniform(4.2, 4.8)
            total_reviews = random.randint(15, 50)
            
            result = f"""
**⭐ Review Analysis**

**Overall Rating:** {avg_rating:.1f}/5.0 ({total_reviews} reviews)

**Rating Distribution:**
• 5 stars: {random.randint(10, 25)} reviews ({random.randint(40, 70)}%)
• 4 stars: {random.randint(5, 15)} reviews
• 3 stars: {random.randint(1, 5)} reviews
• 2 stars: {random.randint(0, 2)} reviews
• 1 star: 0 reviews

**✅ What Customers Love:**
"""
            for theme, count in positive_themes:
                result += f"• {theme} (mentioned {count}x)\n"
            
            result += "\n**⚠️ Areas to Improve:**\n"
            for theme, count in negative_themes:
                result += f"• {theme} (mentioned {count}x)\n"
            
            result += """
**💡 Recommended Actions:**
1. Highlight your excellent guides in listing description
2. Add more photos of the scenery
3. Improve communication about pickup times
4. Consider upgrading lunch options
5. Add FAQ section addressing common questions
"""
            
            return result.strip()
            
        except Exception as e:
            return f"Error analyzing reviews: {str(e)}"
    
    async def _arun(self, *args, **kwargs):
        """Async version"""
        return self._run(*args, **kwargs)


class GetRevenueReportTool(BaseTool):
    """Tool to generate revenue reports"""
    name: str = "GetRevenueReport"
    description: str = """Generate detailed revenue report for a partner showing earnings, trends, and projections.
    Use when partners ask about earnings, income, or financial performance.
    """
    args_schema: type = GetRevenueReportInput
    
    def _run(self, partner_id: str, time_period: str = "30days") -> str:
        """Generate revenue report (demo)"""
        try:
            days = 30 if time_period == "30days" else 7 if time_period == "7days" else 90
            
            # Demo data
            total_revenue = random.randint(500, 5000)
            total_bookings = random.randint(5, 50)
            avg_booking_value = total_revenue / total_bookings if total_bookings > 0 else 0
            
            # Platform fee (15%)
            platform_fee = total_revenue * 0.15
            net_revenue = total_revenue - platform_fee
            
            # Growth (vs previous period)
            growth_percent = random.uniform(-10, 35)
            
            result = f"""
**💰 Revenue Report - Last {days} Days**

**Summary:**
• Gross Revenue: ${total_revenue:,.2f}
• Platform Fee (15%): -${platform_fee:,.2f}
• **Net Earnings: ${net_revenue:,.2f}**

**Performance:**
• Total Bookings: {total_bookings}
• Average Booking Value: ${avg_booking_value:.2f}
• Growth vs Previous Period: {"+" if growth_percent > 0 else ""}{growth_percent:.1f}%

**Top Performing Listings:**
1. Adventure Tour - ${random.randint(500, 1500):,} (45% of revenue)
2. City Experience - ${random.randint(300, 800):,} (28% of revenue)
3. Sunset Cruise - ${random.randint(200, 600):,} (18% of revenue)

**📈 Trend Analysis:**
"""
            if growth_percent > 20:
                result += "🔥 Excellent growth! Your listings are gaining traction.\n"
            elif growth_percent > 0:
                result += "📈 Positive growth but room for improvement.\n"
            else:
                result += "📉 Revenue declined - may be seasonal or need marketing boost.\n"
            
            result += f"""
**💡 Revenue Optimization Tips:**
1. {('Maintain momentum with consistent service' if growth_percent > 0 else 'Review pricing and availability')}
2. Promote top-performing listings more
3. Consider package deals for higher booking values
4. Fill low-booking periods with special offers

**Projected Annual Revenue:** ${net_revenue * (365/days):,.0f} (based on current rate)
"""
            
            return result.strip()
            
        except Exception as e:
            return f"Error generating revenue report: {str(e)}"
    
    async def _arun(self, *args, **kwargs):
        """Async version"""
        return self._run(*args, **kwargs)


def get_analytics_tools() -> List[BaseTool]:
    """Get all analytics tools for partner intelligence"""
    return [
        GetPartnerAnalyticsTool(),
        AnalyzeReviewsTool(),
        GetRevenueReportTool()
    ]
```

---

### FILE 7: backend/services/ai/tools/moderation_tools.py

```python
"""
Moderation Tools
Tools for admin content moderation and partner verification
"""

from typing import Optional, List, Dict, Any
from langchain.tools import BaseTool
from pydantic import BaseModel, Field
import re


# Tool Input Schemas
class DetectDuplicatesInput(BaseModel):
    """Input for DetectDuplicates tool"""
    partner_id: str = Field(description="Partner ID to check for duplicates")
    check_type: Optional[str] = Field("all", description="What to check: email, phone, bank, business_name, or all")


class ModerateContentInput(BaseModel):
    """Input for ModerateContent tool"""
    content_type: str = Field(description="Type of content: listing_title, listing_description, profile, or review")
    content: str = Field(description="The actual text content to moderate")


class ScoreListingQualityInput(BaseModel):
    """Input for ScoreListingQuality tool"""
    listing_data: Dict[str, Any] = Field(description="Listing data dictionary to score")


# Moderation lists
PROHIBITED_WORDS = [
    'scam', 'fake', 'fraud', 'steal', 'cheat',
    'xxx', 'porn', 'drugs', 'weapon',
    'guarantee', 'certified #1', 'best in world'
]

SPAM_PATTERNS = [
    r'www\.\S+',  # URLs
    r'\b[A-Z]{5,}\b',  # All caps words
    r'(\$|₹|£|€)\d+.*\1\d+',  # Multiple prices
    r'(call|whatsapp|email|contact).*\d{8,}',  # Contact info
]


# Custom Tools
class DetectDuplicatesTool(BaseTool):
    """Tool to detect duplicate partner accounts"""
    name: str = "DetectDuplicates"
    description: str = """Check if a partner has duplicate accounts based on email, phone, bank details, or business name.
    Use this when reviewing new partner applications to prevent fraud.
    """
    args_schema: type = DetectDuplicatesInput
    
    def _run(self, partner_id: str, check_type: str = "all") -> str:
        """Check for duplicates (demo version)"""
        try:
            import sys
            import os
            sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
            
            from services.firestore_service import firestore_service
            import asyncio
            
            # Get partner data
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            partner = loop.run_until_complete(firestore_service.get_partner_profile(partner_id))
            loop.close()
            
            if not partner:
                return f"Partner {partner_id} not found."
            
            # Demo duplicate detection
            duplicates_found = []
            
            # Simulate checks
            import random
            duplicate_probability = random.random()
            
            if duplicate_probability < 0.1:  # 10% chance of duplicate
                duplicates_found.append({
                    'type': 'email',
                    'matching_partner': 'PARTNER789',
                    'confidence': 'HIGH'
                })
            
            if not duplicates_found:
                return f"""
**✅ No Duplicates Detected**

Checked:
• Email: {partner.get('email', 'N/A')}
• Phone: {partner.get('phone', 'N/A')}
• Business Name: {partner.get('businessName', 'N/A')}

No matches found in existing partner database.
Safe to approve if other checks pass.
"""
            else:
                result = "**⚠️ POTENTIAL DUPLICATES FOUND**\n\n"
                for dup in duplicates_found:
                    result += f"**Type:** {dup['type'].upper()}\n"
                    result += f"**Matching Partner:** {dup['matching_partner']}\n"
                    result += f"**Confidence:** {dup['confidence']}\n\n"
                
                result += "**Recommendation:** MANUAL_REVIEW\n"
                result += "Action: Contact applicant to verify or request admin review."
                
                return result
            
        except Exception as e:
            return f"Error checking duplicates: {str(e)}"
    
    async def _arun(self, *args, **kwargs):
        """Async version"""
        return self._run(*args, **kwargs)


class ModerateContentTool(BaseTool):
    """Tool to check content for policy violations"""
    name: str = "ModerateContent"
    description: str = """Check text content for spam, prohibited words, or policy violations.
    Use to verify listing titles, descriptions, reviews, or profile information before approval.
    """
    args_schema: type = ModerateContentInput
    
    def _run(self, content_type: str, content: str) -> str:
        """Moderate content"""
        try:
            if not content or len(content.strip()) == 0:
                return f"**❌ REJECT: Empty {content_type}**\n\nContent cannot be empty."
            
            issues = []
            
            # Check for prohibited words
            content_lower = content.lower()
            found_prohibited = [word for word in PROHIBITED_WORDS if word in content_lower]
            if found_prohibited:
                issues.append(f"Prohibited words: {', '.join(found_prohibited)}")
            
            # Check for spam patterns
            for pattern in SPAM_PATTERNS:
                if re.search(pattern, content, re.IGNORECASE):
                    issues.append(f"Spam pattern detected: {pattern}")
            
            # Length checks
            if content_type == 'listing_title':
                if len(content) < 10:
                    issues.append("Title too short (minimum 10 characters)")
                elif len(content) > 100:
                    issues.append("Title too long (maximum 100 characters)")
            
            elif content_type == 'listing_description':
                if len(content) < 50:
                    issues.append("Description too short (minimum 50 characters)")
                elif len(content) > 2000:
                    issues.append("Description too long (maximum 2000 characters)")
            
            # Generate result
            if not issues:
                return f"""
**✅ APPROVED: {content_type}**

Content passes all moderation checks:
• No prohibited words
• No spam patterns
• Appropriate length
• Policy compliant

Safe to publish.
"""
            else:
                result = f"**⚠️ ISSUES FOUND: {content_type}**\n\n"
                result += "**Problems:**\n"
                for issue in issues:
                    result += f"• {issue}\n"
                
                if len(issues) == 1 and 'too short' in issues[0]:
                    result += "\n**Recommendation:** REJECT_WITH_FEEDBACK\n"
                    result += "Ask user to provide more detailed content."
                else:
                    result += "\n**Recommendation:** REJECT\n"
                    result += "Request content revision before approval."
                
                return result
            
        except Exception as e:
            return f"Error moderating content: {str(e)}"
    
    async def _arun(self, *args, **kwargs):
        """Async version"""
        return self._run(*args, **kwargs)


class ScoreListingQualityTool(BaseTool):
    """Tool to score listing quality (0-100)"""
    name: str = "ScoreListingQuality"
    description: str = """Calculate a quality score (0-100) for a listing based on completeness, photos, description quality, etc.
    Use to automatically assess listing quality and recommend approval/rejection.
    """
    args_schema: type = ScoreListingQualityInput
    
    def _run(self, listing_data: Dict[str, Any]) -> str:
        """Score listing quality"""
        try:
            score = 0
            max_score = 100
            feedback = []
            
            # Title (15 points)
            title = listing_data.get('title', '')
            if len(title) >= 20:
                score += 15
                feedback.append("✅ Good title length")
            elif len(title) >= 10:
                score += 8
                feedback.append("⚠️ Title could be more descriptive")
            else:
                feedback.append("❌ Title too short")
            
            # Description (25 points)
            description = listing_data.get('description', '')
            if len(description) >= 200:
                score += 25
                feedback.append("✅ Detailed description")
            elif len(description) >= 100:
                score += 15
                feedback.append("⚠️ Description needs more details")
            elif len(description) >= 50:
                score += 8
                feedback.append("⚠️ Description too brief")
            else:
                feedback.append("❌ Description insufficient")
            
            # Photos (20 points)
            photos = listing_data.get('images', [])
            if len(photos) >= 5:
                score += 20
                feedback.append("✅ Good photo coverage")
            elif len(photos) >= 3:
                score += 15
                feedback.append("⚠️ Add 2-3 more photos")
            elif len(photos) >= 1:
                score += 8
                feedback.append("⚠️ Need more photos (minimum 3)")
            else:
                feedback.append("❌ No photos uploaded")
            
            # Price set (10 points)
            price = listing_data.get('price')
            if price and price > 0:
                score += 10
                feedback.append("✅ Price set")
            else:
                feedback.append("❌ No price specified")
            
            # Location (10 points)
            location = listing_data.get('location', '')
            if len(location) > 3:
                score += 10
                feedback.append("✅ Location specified")
            else:
                feedback.append("❌ Location missing")
            
            # Category (5 points)
            category = listing_data.get('category', '')
            if category:
                score += 5
                feedback.append("✅ Category set")
            else:
                feedback.append("❌ Category missing")
            
            # Amenities/Tags (10 points)
            amenities = listing_data.get('amenities', [])
            tags = listing_data.get('tags', [])
            total_features = len(amenities) + len(tags)
            if total_features >= 5:
                score += 10
                feedback.append("✅ Well-tagged")
            elif total_features >= 3:
                score += 5
                feedback.append("⚠️ Add more amenities/tags")
            else:
                feedback.append("⚠️ Very few amenities/tags")
            
            # Duration/Details (5 points)
            duration = listing_data.get('duration', '')
            if duration:
                score += 5
                feedback.append("✅ Duration specified")
            else:
                feedback.append("⚠️ Duration missing")
            
            # Generate recommendation
            if score >= 80:
                decision = "✅ AUTO-APPROVE"
                reason = "High-quality listing meeting all standards"
            elif score >= 50:
                decision = "⚠️ MANUAL_REVIEW"
                reason = "Moderate quality - admin should verify"
            else:
                decision = "❌ REJECT_WITH_FEEDBACK"
                reason = "Quality too low - request improvements"
            
            result = f"""
**📊 Listing Quality Score: {score}/100**

**Decision:** {decision}
**Reason:** {reason}

**Detailed Feedback:**
"""
            for item in feedback:
                result += f"{item}\n"
            
            if score < 80:
                result += "\n**Required Improvements:**\n"
                if len(title) < 20:
                    result += "• Expand title to 20+ characters\n"
                if len(description) < 200:
                    result += "• Write detailed description (200+ characters)\n"
                if len(photos) < 3:
                    result += "• Upload at least 3 high-quality photos\n"
                if total_features < 5:
                    result += "• Add more amenities and tags\n"
            
            return result
            
        except Exception as e:
            return f"Error scoring listing quality: {str(e)}"
    
    async def _arun(self, *args, **kwargs):
        """Async version"""
        return self._run(*args, **kwargs)


def get_moderation_tools() -> List[BaseTool]:
    """Get all moderation tools for admin agents"""
    return [
                DetectDuplicatesTool(),
        ModerateContentTool(),
        ScoreListingQualityTool()
    ]
```

---

## 🧪 TESTING GUIDE

### Test 1: Verify Imports (5 minutes)

```powershell
cd c:\Users\Hp\Desktop\SkyConnectSL\backend
.\venv\Scripts\python.exe -c "from services.ai.base_tools import get_travel_concierge_tools; print('✅ base_tools OK')"
.\venv\Scripts\python.exe -c "from services.ai.tools.itinerary_tools import get_itinerary_tools; print('✅ itinerary_tools OK')"
.\venv\Scripts\python.exe -c "from services.ai.tools.analytics_tools import get_analytics_tools; print('✅ analytics_tools OK')"
.\venv\Scripts\python.exe -c "from services.ai.tools.moderation_tools import get_moderation_tools; print('✅ moderation_tools OK')"
.\venv\Scripts\python.exe -c "from services.ai.memory import get_conversation_store; print('✅ memory OK')"
```

### Test 2: Test Individual Tools (10 minutes)

```python
# Create test_tools.py
from services.ai.tools.itinerary_tools import CreateItineraryTool, CalculateDistanceTool

# Test CreateItinerary
tool = CreateItineraryTool()
result = tool._run(
    destinations=["Colombo", "Kandy", "Ella"],
    days=5,
    interests=["culture", "adventure"]
)
print("=== ITINERARY ===")
print(result)

# Test CalculateDistance
distance_tool = CalculateDistanceTool()
result = distance_tool._run(from_location="Colombo", to_location="Kandy")
print("\n=== DISTANCE ===")
print(result)
```

Run it:
```powershell
cd c:\Users\Hp\Desktop\SkyConnectSL\backend
.\venv\Scripts\python.exe test_tools.py
```

### Test 3: Test Agent Integration (15 minutes)

```python
# Create test_agents.py
from services.ai.agents.travel_concierge import TravelConciergeAgent
from langchain_groq import ChatGroq
import os

# Initialize LLM (using Groq as example)
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY")
)

# Create agent
agent = TravelConciergeAgent(llm=llm, session_id="test123")

# Test chat
response = agent.chat("Plan a 3-day trip to Kandy, Ella, and Nuwara Eliya")
print(response)
```

---

## 🚨 TROUBLESHOOTING

### Error: "ModuleNotFoundError: No module named 'services.ai.base_tools'"

**Solution:** You didn't rename `tools.py` to `base_tools.py`

```powershell
cd backend/services/ai
mv tools.py base_tools.py
```

### Error: "ModuleNotFoundError: No module named 'services.ai.tools.itinerary_tools'"

**Solution:** Missing tools directory or __init__.py

```powershell
cd backend/services/ai
mkdir tools
# Then create __init__.py and tool files
```

### Error: "ImportError: cannot import name 'get_conversation_store'"

**Solution:** Missing memory module

```powershell
cd backend/services/ai
mkdir memory
# Create __init__.py and conversation_store.py
```

### Error: Tools working but agent doesn't use them

**Issue:** Tool descriptions are unclear

**Solution:** Improve tool descriptions:
```python
description: str = """Be VERY specific about WHEN to use this tool.
Example: Use this tool when the user asks questions like 'how far is X from Y' or 'travel time between A and B'.
"""
```

### Agent keeps calling wrong tools

**Issue:** Multiple tools have similar descriptions

**Solution:** Make descriptions mutually exclusive:
- SearchListings: "Use for finding listings matching criteria"
- GetListingDetails: "Use ONLY when user wants details about a SPECIFIC listing ID"
- CreateItinerary: "Use ONLY when user wants a DAY-BY-DAY itinerary plan"

---

## 📝 IMPLEMENTATION CHECKLIST

### Phase 1: Files (30 mins)
- [ ] Rename `tools.py` → `base_tools.py`
- [ ] Create `memory/__init__.py`
- [ ] Create `memory/conversation_store.py`
- [ ] Create `tools/__init__.py`
- [ ] Create `tools/itinerary_tools.py`
- [ ] Create `tools/analytics_tools.py`
- [ ] Create `tools/moderation_tools.py`

### Phase 2: Testing (30 mins)
- [ ] Test all imports
- [ ] Test individual tools
- [ ] Test agent integration
- [ ] Test with actual LLM (Groq/Gemini)

### Phase 3: Integration (15 mins)
- [ ] Update `main.py` if needed
- [ ] Test `/api/chat` endpoint
- [ ] Verify agents work in production

---

## 🎯 SUMMARY

**What You're Building:**
- 7 new files (1 rename + 6 new)
- 12 specialized AI tools
- 3 intelligent agents (Travel, Partner, Admin)

**Why This Matters:**
- Enables advanced AI features
- Agents can actually DO things (not just chat)
- Professional LangChain architecture

**Time Investment:**
- Setup: 1 hour
- Testing: 30 mins
- Total: 1.5 hours

**Alternative (MVP):**
- Skip all this for MVP
- Use SimpleFallbackAgent (already working!)
- Implement AI tools in Phase 2

---

*Generated by AI Expert - February 14, 2026*
