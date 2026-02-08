"""
Knowledge Base Embeddings Manager
Handles ChromaDB vector database operations for semantic search
"""

import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
import chromadb
from chromadb.config import Settings

# Import Firestore service
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from services.firestore_service import firestore_service


class KnowledgeBaseTrainer:
    """Manages vector embeddings for AI semantic search"""
    
    def __init__(self, persist_directory: str = "./chroma_data"):
        """
        Initialize the knowledge base trainer
        
        Args:
            persist_directory: Directory to persist ChromaDB data
        """
        self.persist_directory = persist_directory
        
        # Use free Hugging Face embeddings (no API key needed)
        print("📦 Loading embedding model...")
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        print("✅ Embedding model loaded")
        
        # Initialize ChromaDB client
        self.chroma_client = chromadb.Client(Settings(
            persist_directory=persist_directory,
            anonymized_telemetry=False
        ))
        
        # Initialize vector store
        self.vectorstore = Chroma(
            collection_name="skyconnect_knowledge",
            embedding_function=self.embeddings,
            persist_directory=persist_directory
        )
        
        self.last_sync = None
    
    async def train_listings(self) -> int:
        """
        Embed all approved listings into vector database
        
        Returns:
            Number of listings embedded
        """
        print("📚 Training on listings...")
        
        try:
            listings = await firestore_service.get_all_listings(status="approved")
            
            if not listings:
                print("⚠️  No approved listings found")
                return 0
            
            documents = []
            metadatas = []
            ids = []
            
            for listing in listings:
                # Create rich text representation for semantic search
                text_parts = [
                    f"Title: {listing.get('title', 'N/A')}",
                    f"Description: {listing.get('description', 'N/A')}",
                    f"Category: {listing.get('category', 'N/A')}",
                    f"Location: {listing.get('location', 'N/A')}",
                    f"Price: ${listing.get('price', 0)} {listing.get('currency', 'USD')}",
                ]
                
                # Add amenities if available
                if listing.get('amenities'):
                    text_parts.append(f"Amenities: {', '.join(listing['amenities'])}")
                
                # Add duration if available
                if listing.get('duration'):
                    text_parts.append(f"Duration: {listing['duration']}")
                
                # Add tags if available
                if listing.get('tags'):
                    text_parts.append(f"Tags: {', '.join(listing['tags'])}")
                
                # Combine all parts
                full_text = "\n".join(text_parts)
                
                documents.append(full_text)
                metadatas.append({
                    'id': listing.get('id', ''),
                    'title': listing.get('title', ''),
                    'category': listing.get('category', ''),
                    'location': listing.get('location', ''),
                    'price': listing.get('price', 0),
                    'partnerId': listing.get('partnerId', ''),
                    'type': 'listing'
                })
                ids.append(f"listing_{listing.get('id', '')}")
            
            # Add documents to vector store
            if documents:
                self.vectorstore.add_texts(
                    texts=documents,
                    metadatas=metadatas,
                    ids=ids
                )
                
                print(f"✅ Embedded {len(documents)} listings")
                return len(documents)
            
            return 0
            
        except Exception as e:
            print(f"❌ Error training listings: {e}")
            return 0
    
    async def train_partners(self) -> int:
        """
        Embed approved partner profiles into vector database
        
        Returns:
            Number of partners embedded
        """
        print("📚 Training on partner profiles...")
        
        try:
            partners = await firestore_service.get_all_partners(status="approved")
            
            if not partners:
                print("⚠️  No approved partners found")
                return 0
            
            documents = []
            metadatas = []
            ids = []
            
            for partner in partners:
                text_parts = [
                    f"Business: {partner.get('businessName', 'N/A')}",
                    f"Category: {partner.get('businessCategory', 'N/A')}",
                    f"Description: {partner.get('description', 'N/A')}",
                    f"Location: {partner.get('businessAddress', 'N/A')}",
                ]
                
                if partner.get('websiteUrl'):
                    text_parts.append(f"Website: {partner['websiteUrl']}")
                
                full_text = "\n".join(text_parts)
                
                documents.append(full_text)
                metadatas.append({
                    'id': partner.get('userId', ''),
                    'businessName': partner.get('businessName', ''),
                    'category': partner.get('businessCategory', ''),
                    'type': 'partner'
                })
                ids.append(f"partner_{partner.get('userId', '')}")
            
            if documents:
                self.vectorstore.add_texts(
                    texts=documents,
                    metadatas=metadatas,
                    ids=ids
                )
                
                print(f"✅ Embedded {len(documents)} partners")
                return len(documents)
            
            return 0
            
        except Exception as e:
            print(f"❌ Error training partners: {e}")
            return 0
    
    async def train_travel_guide(self) -> int:
        """Add Sri Lanka travel knowledge to vector database"""
        print("📚 Training on travel guide...")
        
        # Comprehensive Sri Lanka travel guide sections
        guide_sections = [
            {
                'title': 'Best Time to Visit Sri Lanka',
                'content': '''Sri Lanka has two monsoon seasons, creating distinct travel periods for different regions.

West & South Coast (Colombo, Galle, Bentota, Mirissa):
- Best Season: December to March (dry, sunny, perfect beach weather)
- Good: April and November (transition periods)
- Avoid: May to September (southwest monsoon, heavy rain)

East Coast (Trincomalee, Arugam Bay, Batticaloa):
- Best Season: April to September (dry season, ideal for beaches)
- Good: March and October
- Avoid: October to January (northeast monsoon)

Hill Country (Kandy, Nuwara Eliya, Ella):
- Best Season: January to March (clear skies, cool weather)
- Good: Year-round destination, mild climate
- Coolest: December to February (15-20°C)
- Note: Can be misty and rainy April-September

Cultural Triangle (Sigiriya, Polonnaruwa, Anuradhapura):
- Best Season: April to September (dry period)
- Good: January to March
- Avoid: October to January (wet season)

Pro Tips:
- December to March: Peak tourist season, book ahead
- Whale watching in Mirissa: December to April
- Surfing in Arugam Bay: May to September
- Tea country festivals: August (Kandy Esala Perahera)'''
            },
            {
                'title': 'Top Destinations in Sri Lanka',
                'content': '''1. Colombo - Vibrant Capital City
   - Modern shopping malls and colonial architecture
   - Galle Face Green for sunset views
   - Vibrant nightlife and diverse dining
   - Gateway to Sri Lanka

2. Kandy - Cultural Heart
   - Temple of the Tooth Relic (UNESCO site)
   - Beautiful Kandy Lake
   - Traditional Kandyan dance performances
   - Tea plantations nearby

3. Sigiriya - Ancient Rock Fortress
   - UNESCO World Heritage Site
   - 5th century palace ruins on 200m rock
   - Spectacular 360-degree views
   - Ancient frescoes and mirror wall

4. Ella - Mountain Paradise
   - Nine Arch Bridge (Instagram famous)
   - Little Adam's Peak (easy hike, amazing views)
   - Scenic train journey from Kandy
   - Tea plantations and waterfalls

5. Galle - Colonial Fort City
   - Dutch fort (UNESCO site)
   - Charming cafes and boutique hotels
   - Beautiful beaches nearby
   - Historical lighthouse

6. Mirissa - Beach & Whales
   - Pristine beaches and beach bars
   - Whale watching (Dec-Apr)
   - Relaxed backpacker vibe
   - Surfing and snorkeling

7. Arugam Bay - Surf Paradise
   - World-class surf breaks
   - Laid-back beach town
   - Kumana National Park nearby
   - Best: May-September

8. Yala National Park - Wildlife Safari
   - Highest leopard density in world
   - Elephants, sloth bears, crocodiles
   - Best: February-July (dry season)
   - Morning and evening game drives

9. Nuwara Eliya - Tea Country
   - Cool climate (15-20°C)
   - British colonial bungalows
   - Tea factory tours
   - Hiking and waterfalls

10. Trincomalee - East Coast Beaches
    - Stunning Nilaveli and  Uppuveli beaches
    - Excellent diving and snorkeling
    - Less touristy than west coast
    - Best: March-October'''
            },
            {
                'title': 'Sri Lanka Visa and Entry Requirements',
                'content': '''Electronic Travel Authorization (ETA):

Required for Most Countries:
- Apply online: www.eta.gov.lk
- Cost: $50 USD for tourist visa
- Validity: 30 days (double entry)
- Processing: Usually instant, up to 24 hours
- Can extend to 90 days in Sri Lanka

Visa-Free Countries (30 days):
- Singapore
- Maldives
- Seychelles

Visa on Arrival:
- Available at Bandaranaike International Airport
- Same price and conditions as ETA
- Longer processing time

Entry Requirements:
- Passport valid for 6 months from entry date
- Return or onward ticket
- Sufficient funds for stay
- Accommodation booking confirmation

COVID-19 Updates (check current status):
- Requirements may vary
- Check official Sri Lanka Tourism website

Pro Tips:
- Apply for ETA at least 3 days before travel
- Print ETA approval (backup)
- Keep passport copy and digital backup'''
            },
            {
                'title': 'Transportation in Sri Lanka',
                'content': '''Trains - Scenic and Affordable:
- Famous routes: Colombo-Kandy-Ella (must-do!)
- Classes: 1st (reserved), 2nd (seats), 3rd (crowded)
- Book 1st class observation car in advance
- Slow but scenic (Kandy-Ella: 7 hours)
- Prices: Very cheap ($2-10 for long journeys)

Buses - Extensive Network:
- Government buses: Cheapest, crowded
- Private AC express: Comfortable, moderate price
- Covers every corner of Sri Lanka
- Typical cost: $1-5 for long distance

Tuk-tuks (Three-wheelers):
- Ideal for short distances in cities
- Always negotiate price BEFORE riding
- Typical: 50-100 LKR per km
- Use PickMe app for fixed prices
- Can charter for day trips

Uber and PickMe:
- Available in Colombo and major cities
- Reliable pricing
- Safer than street tuk-tuks
- PickMe more popular in Sri Lanka

Private Drivers:
- Most comfortable option
- $40-70 per day (8-10 hours)
- Driver acts as guide
- Car + driver can be arranged through hotels
- Great for multi-day tours

Rental Cars:
- Self-drive available but challenging
- Traffic can be chaotic
- International license required
- $30-80 per day

Domestic Flights:
- Cinnamon Air, Fits Air
- Save time for long distances
- Expensive compared to other transport
- Seaplane tours available'''
            },
            {
                'title': 'Sri Lankan Cuisine and Food Safety',
                'content': '''Must-Try Dishes:

Rice and Curry - National Dish:
- Rice with 5-10 different curries
- Vegetables, dhal, fish or meat
- Served on banana leaf (traditional)
- Available everywhere, $2-5

Hoppers (Appa):
- Bowl-shaped coconut pancakes
- Egg hopper: egg in center
- Eaten for breakfast or dinner
- Sweet or savory versions

Kottu Roti:
- Chopped roti stir-fried with vegetables/meat
- Made on hot griddle with loud rhythmic chopping
- Popular street food
- Chicken, beef, vegetable versions

String Hoppers:
- Steamed rice noodle nests
- Eaten with curry for breakfast
- Light and delicious

Lamprais:
- Rice, meat, and sambol in banana leaf
- Baked Dutch-influenced dish
- Try in Colombo

Seafood:
- Fresh fish, prawns, crab
- Crab curry is famous
- Beachside restaurants serve best
- Affordable and delicious

Drinks:
- Ceylon Tea - world famous
- King Coconut - refreshing, electrolytes
- Fresh fruit juices - mango, lime, passion fruit
- Arrack - local spirit
- Lion Lager - local beer

Food Safety Tips:
- Drink only bottled water
- Avoid ice in drinks
- Eat at busy restaurants (fresh food)
- Rice and curry generally very safe
- Wash hands frequently
- Peel fruits yourself
- Hot food is safer than room temperature

Dietary Accommodations:
- Vegetarian very common (ask for veg curry)
- Vegan options available
- Halal food widely available
- Gluten-free: rice-based cuisine helps'''
            },
            {
                'title': 'Budget Guide for Sri Lanka',
                'content': '''Daily Budget Ranges (USD per person):

Backpacker Budget: $20-40/day
- Accommodation: $8-15 (hostels, guesthouses)
- Food: $5-10 (local food, street food)
- Transport: $3-8 (buses, trains)
- Activities: $5-10 (free beaches, temples)
- Total: Comfortable on $25-30/day

Mid-Range: $50-120/day
- Accommodation: $25-50 (nice guesthouses, 3-star hotels)
- Food: $15-30 (mix of local and restaurants)
- Transport: $15-30 (tuk-tuks, some private drivers)
- Activities: $20-40 (safaris, tours, entrance fees)
- Total: $60-80/day is comfortable

Luxury: $150+/day
- Accommodation: $80-300 (boutique hotels, resorts)
- Food: $30-60 (fine dining, hotel restaurants)
- Transport: $40-80 (private driver daily)
- Activities: $50-150 (premium tours, spa)
- Total: $200+/day for luxury experience

Specific Costs:
- Beer: $2-4
- Meal (local restaurant): $3-6
- Meal (tourist restaurant): $8-15
- Tuk-tuk (short ride): $1-3
- Safari (Yala): $40-80
- Sigiriya entrance: $30
- Train (Kandy-Ella): $3-10
- Temple entrance: $0-20

Money Saving Tips:
- Eat local rice and curry (delicious and cheap)
- Use buses instead of private transport
- Book accommodation directly (better rates)
- Visit free attractions (beaches, many temples)
- Bargain at markets and with tuk-tuk drivers
- Travel off-peak (April-November)

ATMs and Money:
- ATMs widely available in cities
- Credit cards accepted in tourist areas
- Carry cash for rural areas and tuk-tuks
- Sri Lankan Rupee (LKR): ~300-350 per USD
- Inform bank before traveling'''
            }
        ]
        
        documents = []
        metadatas = []
        ids = []
        
        for idx, section in enumerate(guide_sections):
            full_text = f"{section['title']}\n\n{section['content']}"
            
            documents.append(full_text)
            metadatas.append({
                'title': section['title'],
                'type': 'travel_guide',
                'section_id': idx
            })
            ids.append(f"guide_{idx}")
        
        if documents:
            self.vectorstore.add_texts(
                texts=documents,
                metadatas=metadatas,
                ids=ids
            )
            
            print(f"✅ Embedded {len(documents)} travel guide sections")
            return len(documents)
        
        return 0
    
    async def train_all(self) -> Dict[str, int]:
        """
        Run complete training pipeline
        
        Returns:
            Dictionary with counts of embedded documents by type
        """
        print("🚀 Starting knowledge base training...\n")
        
        results = {
            'listings': await self.train_listings(),
            'partners': await self.train_partners(),
            'travel_guide': await self.train_travel_guide()
        }
        
        # Persist to disk
        self.vectorstore.persist()
        
        total = sum(results.values())
        print(f"\n✅ Training complete! Total documents embedded: {total}")
        print(f"📊 Breakdown: {results}")
        
        self.last_sync = datetime.now()
        
        return results
    
    def search(self, query: str, k: int = 5, filter_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Search the knowledge base
        
        Args:
            query: Search query
            k: Number of results
            filter_type: Filter by type (listing, partner, travel_guide)
            
        Returns:
            List of relevant documents with metadata
        """
        try:
            # Build filter if specified
            where_filter = None
            if filter_type:
                where_filter = {"type": filter_type}
            
            # Search
            results = self.vectorstore.similarity_search(
                query=query,
                k=k,
                filter=where_filter
            )
            
            return [
                {
                    'content': doc.page_content,
                    'metadata': doc.metadata
                }
                for doc in results
            ]
            
        except Exception as e:
            print(f"❌ Error searching: {e}")
            return []
    
    async def incremental_update(self, since_minutes: int = 15) -> int:
        """
        Update only recently changed listings
        
        Args:
            since_minutes: Get listings updated in last N minutes
            
        Returns:
            Number of documents updated
        """
        try:
            since_date = datetime.now() - timedelta(minutes=since_minutes)
            new_listings = await firestore_service.get_listings_since(since_date)
            
            if not new_listings:
                return 0
            
            print(f"🔄 Updating {len(new_listings)} recently changed listings...")
            
            # Re-embed updated listings
            # (In production, you'd want to delete old versions first)
            count = await self.train_listings()
            
            self.last_sync = datetime.now()
            return count
            
        except Exception as e:
            print(f"❌ Error in incremental update: {e}")
            return 0


# Singleton instance
knowledge_base = None

def get_knowledge_base() -> KnowledgeBaseTrainer:
    """Get or create knowledge base instance"""
    global knowledge_base
    if knowledge_base is None:
        persist_dir = os.getenv('CHROMA_PERSIST_DIRECTORY', './chroma_data')
        knowledge_base = KnowledgeBaseTrainer(persist_directory=persist_dir)
    return knowledge_base
