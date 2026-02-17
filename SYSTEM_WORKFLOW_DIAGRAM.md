# SkyConnect SL - Technical & Workflow Diagrams

---

## 📱 1. OVERALL SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER (Mobile App)                         │
│                    React Native + TypeScript                     │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTP/HTTPS Requests
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
┌──────────┐          ┌──────────────┐
│ Firebase │          │   Backend    │
│ Services │          │   API        │
│          │          │  (FastAPI)   │
│ • Auth   │          │  Port: 8000  │
│ • Firestore │       └──────┬───────┘
│ • Storage│                 │
└──────────┘                 │
                             ▼
                    ┌────────────────┐
                    │   AI System    │
                    │   (Hybrid)     │
                    │                │
                    │ • LangChain    │
                    │ • Groq/Gemini  │
                    │ • ChromaDB     │
                    └────────────────┘
```

---

## 🔄 2. USER JOURNEY - TRAVELER FLOW

```
START: User Opens App
       ↓
   ┌───────────┐
   │ Onboarding │ (4 slides explaining SkyConnect)
   └─────┬─────┘
         ↓
   ┌──────────┐
   │ Sign Up  │ → Firebase Auth → Create user account
   └─────┬────┘       ↓
         │      Email Verification
         ↓            ↓
   ┌───────────────────┐
   │ Email Verification│ → Check inbox → Verify
   └─────┬─────────────┘
         ↓
   ┌───────────────────┐
   │ Create Profile    │ → Upload photo → Set preferences
   │ (Traveler)        │    Budget range, travel type
   └─────┬─────────────┘
         │
         ↓
   ┌───────────────────┐
   │ Home Dashboard    │ → Featured listings, quick actions
   └─────┬─────────────┘
         │
         ├─→ Browse Listings → Search/Filter → View Details
         │                                     ↓
         │                              ┌─────────────┐
         │                              │ Book Listing│
         │                              └──────┬──────┘
         │                                     ↓
         │                              ┌─────────────┐
         │                              │ Payment     │
         │                              │ (Pending)   │
         │                              └─────────────┘
         │
         ├─→ AI Chat → Ask questions → Get recommendations
         │
         ├─→ My Bookings → View upcoming trips
         │
         └─→ Favorites → Saved listings

END: User completes booking or browses
```

---

## 🏢 3. USER JOURNEY - PARTNER FLOW

```
START: Partner Opens App
       ↓
   ┌──────────┐
   │ Sign Up  │ → Select "Partner" role
   └─────┬────┘
         ↓
   ┌───────────────────┐
   │ Create Partner    │ → Upload business logo
   │ Profile           │    Business documents
   │                   │    Registration number
   └─────┬─────────────┘
         │
         ↓ (Firestore: status = "pending")
         │
   ┌───────────────────┐
   │ Pending Approval  │ → Wait for admin review
   └─────┬─────────────┘
         │
         ↓ (Admin approves)
         │
   ┌───────────────────┐
   │ Partner Dashboard │ → Analytics, revenue, bookings
   └─────┬─────────────┘
         │
         ├─→ Create Listing → Upload photos → Set price
         │                    Category, location, amenities
         │                    ↓
         │              ┌─────────────┐
         │              │ Submit for  │
         │              │ Moderation  │
         │              └─────────────┘
         │
         ├─→ View Listings → Edit/Delete own listings
         │
         ├─→ View Bookings → Confirm/Cancel bookings
         │
         └─→ Analytics → Revenue trends, performance

END: Partner manages business
```

---

## 👨‍💼 4. ADMIN WORKFLOW

```
START: Admin Login
       ↓
   ┌───────────────────┐
   │ Admin Dashboard   │
   └─────┬─────────────┘
         │
         ├─→ Review Partner Applications
         │   ↓
         │   • View business details
         │   • Check documents
         │   • Approve or Reject → Update Firestore
         │                        → Send notification
         │
         ├─→ Moderate Listings
         │   ↓
         │   • Review new listings
         │   • Check for policy violations
         │   • Approve or Remove
         │
         ├─→ View Analytics
         │   ↓
         │   • Total travelers, partners, listings
         │   • Platform growth metrics
         │
         └─→ User Management
             ↓
             • Ban/unban users
             • Handle reports

END: Platform moderated
```

---

## 🤖 5. AI SYSTEM WORKFLOW (DETAILED!)

### **A. Chat Query Flow**

```
User types: "Show me beach resorts under $100"
       ↓
┌──────────────────────────────────────────────────────────┐
│ STEP 1: INTENT CLASSIFICATION (Hybrid Approach)          │
└─────┬────────────────────────────────────────────────────┘
      │
      ├─→ Phase 1: Keyword Matching
      │   • Regex patterns: \b(show|find|search)\b
      │   • Match found → Intent: "recommendation_query"
      │   • Confidence: HIGH
      │
      └─→ Phase 2: Embedding Similarity (if Phase 1 fails)
          • Convert query → vector (Sentence Transformers)
          • Compare with example embeddings
          • Top match → Intent
          ↓
┌──────────────────────────────────────────────────────────┐
│ STEP 2: ROLE VALIDATION (RBAC)                          │
└─────┬────────────────────────────────────────────────────┘
      │
      • Extract user_id from auth token
      • Check Firestore: user role = "traveler"
      • Verify permissions for this intent
      • ✅ Authorized → Continue
      ↓
┌──────────────────────────────────────────────────────────┐
│ STEP 3: QUERY ROUTING                                   │
└─────┬────────────────────────────────────────────────────┘
      │
      • Intent: "recommendation_query"
      • Router decision: Use DATABASE + AGENT
      │
      ├─→ NOT "policy_question" → Skip RAG
      └─→ Needs LLM reasoning → Use Agent
          ↓
┌──────────────────────────────────────────────────────────┐
│ STEP 4: AGENT EXECUTION (LangChain ReAct)               │
└─────┬────────────────────────────────────────────────────┘
      │
      │ Agent: Travel Concierge
      │
      ├─→ Thought: "Need to search listings with filters"
      │
      ├─→ Action: search_listings_tool
      │   • Action Input: {
      │       "category": "accommodation",
      │       "tags": ["beach"],
      │       "max_price": 100
      │     }
      │
      ├─→ Observation: Tool queries Firestore
      │   • FirestoreRepository.get_listings(filters)
      │   • Returns: 12 matching listings
      │
      ├─→ Thought: "Found results, should format nicely"
      │
      └─→ Final Answer: LLM formats response
          ↓
┌──────────────────────────────────────────────────────────┐
│ STEP 5: LLM PROVIDER (Multi-Provider Fallback)          │
└─────┬────────────────────────────────────────────────────┘
      │
      ├─→ TRY: Groq API (LLaMA 3.3-70B)
      │   • Prompt: "Format these 12 beach resorts..."
      │   • Response time: 520ms
      │   • ✅ SUCCESS
      │   ↓
      │   Response: "I found 12 beach resorts under $100!
      │              Here are the top 3:
      │              1. Sunny Beach Villa - $85/night..."
      │
      └─→ IF GROQ FAILS:
          ├─→ TRY: Gemini API
          │   • Same prompt
          │   • Response time: 850ms
          │
          └─→ IF GEMINI FAILS:
              • Return raw listing data (no LLM formatting)
              • Still functional!
      ↓
┌──────────────────────────────────────────────────────────┐
│ STEP 6: RESPONSE FORMATTING & RETURN                    │
└─────┬────────────────────────────────────────────────────┘
      │
      • Package response as JSON
      • Log metrics (latency, provider used, intent confidence)
      • Return to mobile app
      ↓
Mobile app displays AI response in chat UI
```

---

## 🔍 6. RAG SYSTEM WORKFLOW (Policy Questions)

```
User asks: "What's your refund policy?"
       ↓
┌──────────────────────────────────────────────────────────┐
│ STEP 1: INTENT CLASSIFICATION                           │
└─────┬────────────────────────────────────────────────────┘
      │
      • Keywords: "refund", "policy"
      • Intent: "policy_question"
      ↓
┌──────────────────────────────────────────────────────────┐
│ STEP 2: QUERY ROUTER → RAG ENGINE                       │
└─────┬────────────────────────────────────────────────────┘
      │
      • Policy questions use RAG (not database)
      ↓
┌──────────────────────────────────────────────────────────┐
│ STEP 3: DOCUMENT RETRIEVAL (ChromaDB)                   │
└─────┬────────────────────────────────────────────────────┘
      │
      ├─→ Convert query → embedding (384 dimensions)
      │   • Sentence Transformers: all-MiniLM-L6-v2
      │
      ├─→ Search ChromaDB "policies" collection
      │   • Cosine similarity search
      │   • Retrieve top 3 documents
      │
      └─→ Results:
          1. Refund Policy Doc (similarity: 0.92)
          2. Cancellation Policy (similarity: 0.78)
          3. Terms of Service (similarity: 0.65)
      ↓
┌──────────────────────────────────────────────────────────┐
│ STEP 4: LLM SYNTHESIS                                   │
└─────┬────────────────────────────────────────────────────┘
      │
      • Prompt Template:
        "Based on these documents:
         [Document 1: Refund Policy...]
         [Document 2: Cancellation...]
         
         Answer: What's your refund policy?"
      │
      ├─→ Send to Groq/Gemini
      │
      └─→ LLM Response:
          "Our refund policy allows full refunds if
           cancelled 48 hours before booking date..."
      ↓
Return formatted answer to user
```

---

## 💾 7. DATABASE OPERATIONS (Firestore)

### **A. Create Listing Flow**

```
Partner clicks "Create Listing"
       ↓
Mobile App: CreateListingScreen.tsx
       ↓
User fills form:
  • Title, description, category
  • Price, location, amenities
  • Upload 5 photos
       ↓
┌──────────────────────────────────────────────────────────┐
│ Image Upload (Firebase Storage)                         │
└─────┬────────────────────────────────────────────────────┘
      │
      ├─→ storageService.uploadListingImages()
      │   • Compress images
      │   • Upload to: /listings/{listingId}/{image1.jpg}
      │   • Get download URLs
      │
      └─→ URLs: [
            "https://storage.firebase.com/.../image1.jpg",
            "https://storage.firebase.com/.../image2.jpg"
          ]
      ↓
┌──────────────────────────────────────────────────────────┐
│ Create Firestore Document                               │
└─────┬────────────────────────────────────────────────────┘
      │
      • firestoreService.createListing({
          partnerId: "user123",
          title: "Beach Villa",
          category: "accommodation",
          price: 85,
          images: [...URLs],
          status: "pending"  ← Awaiting admin approval
        })
      │
      ├─→ Firestore: listings collection
      │   • Auto-generate document ID
      │   • Set createdAt timestamp
      │   • Index by: status, category, price
      │
      └─→ Response: { id: "listing789", success: true }
      ↓
Mobile app shows: "Listing submitted for review!"
```

### **B. Search Listings Flow**

```
User searches: "Beach resorts, max $100"
       ↓
Mobile App: BrowseListingsScreen.tsx
       ↓
┌──────────────────────────────────────────────────────────┐
│ Query Firestore with Filters                            │
└─────┬────────────────────────────────────────────────────┘
      │
      • firestoreService.searchListings({
          category: "accommodation",
          tags: ["beach"],
          maxPrice: 100,
          status: "approved"  ← Only approved listings
        })
      │
      ├─→ Firestore Query:
      │   • Collection: listings
      │   • Where: status == "approved"
      │   • Where: category == "accommodation"
      │   • Where: tags array-contains "beach"
      │   • Where: price <= 100
      │   • OrderBy: price ASC
      │   • Uses composite index! (fast)
      │
      └─→ Returns: 12 listings
      ↓
Mobile app displays results in grid/list view
```

---

## 🔐 8. AUTHENTICATION FLOW

```
User clicks "Sign Up"
       ↓
┌──────────────────────────────────────────────────────────┐
│ Firebase Auth Registration                              │
└─────┬────────────────────────────────────────────────────┘
      │
      • Email: user@example.com
      • Password: ******** (min 6 chars)
      • Role: "traveler" (selected from dropdown)
      │
      ├─→ Firebase Auth API
      │   • Create user account
      │   • Returns: { uid: "abc123", email: "..." }
      │
      └─→ Send email verification
          ↓
┌──────────────────────────────────────────────────────────┐
│ Create User Document (Firestore)                        │
└─────┬────────────────────────────────────────────────────┘
      │
      • firestoreService.createUserDocument({
          uid: "abc123",
          email: "user@example.com",
          role: "traveler",
          emailVerified: false
        })
      │
      └─→ Firestore: users/abc123
          ↓
┌──────────────────────────────────────────────────────────┐
│ Token Storage (AsyncStorage)                            │
└─────┬────────────────────────────────────────────────────┘
      │
      • Save auth token locally
      • Set AuthContext state: { user, role }
      ↓
Navigate to Email Verification Screen

─────────────────────────────────────────────────────────

User verifies email → clicks link in inbox
       ↓
Email verified = true in Firebase Auth
       ↓
App detects verification (reloadUser)
       ↓
Navigate to Create Profile Screen
```

---

## 📊 9. DATA FLOW DIAGRAM

```
┌─────────────┐
│ Mobile App  │
│ (Frontend)  │
└──────┬──────┘
       │
       │ 1. User Action (signup, search, chat)
       │
       ▼
┌──────────────┐         ┌─────────────┐
│ AuthContext  │←────────│ Firebase    │
│ (State)      │  Token  │ Auth        │
└──────┬───────┘         └─────────────┘
       │
       │ 2. Call Service Layer
       │
       ▼
┌──────────────────────────────────┐
│ Service Layer                    │
│ • firestoreService.ts            │
│ • storageService.ts              │
│ • authService.ts (calls backend) │
└──────┬───────────────────────────┘
       │
       │ 3a. Direct Firebase     OR    3b. Backend API
       │     (most operations)          (AI queries)
       │
   ┌───┴────┐                    ┌─────────────┐
   ▼        ▼                    ▼             │
┌────────┐ ┌─────────┐    ┌──────────┐        │
│Firestore│ │Storage  │    │ FastAPI  │        │
│        │ │         │    │ Backend  │        │
└────────┘ └─────────┘    └────┬─────┘        │
                                │              │
                                ▼              │
                          ┌──────────────┐     │
                          │ Hybrid AI    │     │
                          │ System       │     │
                          └────┬─────────┘     │
                               │               │
                ┌──────────────┼──────────┐    │
                ▼              ▼          ▼    │
         ┌──────────┐   ┌──────────┐ ┌──────┐ │
         │ Database │   │   RAG    │ │Agent │ │
         │ Engine   │   │  Engine  │ │Tools │ │
         └────┬─────┘   └────┬─────┘ └───┬──┘ │
              │              │            │    │
              │              ▼            │    │
              │         ┌─────────┐      │    │
              │         │ChromaDB │      │    │
              │         │(Vectors)│      │    │
              │         └─────────┘      │    │
              │                          │    │
              └──────────┬───────────────┘    │
                         ▼                    │
                  ┌──────────────┐            │
                  │ LLM Provider │            │
                  │ (Groq/Gemini)│            │
                  └──────┬───────┘            │
                         │                    │
                         └────────────────────┘
                         │
                         ▼
                    Response to mobile app
```

---

## ⏱️ 10. TYPICAL REQUEST TIMELINE

### **Simple Query (Database path):**
```
User: "Show my bookings"
├─ 0ms:   User taps "My Bookings"
├─ 10ms:  firestoreService.getTravelerBookings()
├─ 50ms:  Firestore query executes (indexed)
├─ 120ms: Data returned from Firestore
├─ 130ms: React renders booking list
└─ 130ms: User sees results

Total: 130ms ✅ Fast!
```

### **AI Query (Agent + LLM path):**
```
User: "Recommend beach resorts for families"
├─ 0ms:    User sends chat message
├─ 5ms:    POST /api/ai/query
├─ 15ms:   Intent classification (keyword match)
├─ 20ms:   Role validation (check auth token)
├─ 25ms:   Query router → Agent path
├─ 30ms:   Travel Concierge Agent initialized
├─ 50ms:   Agent: search_listings_tool executes
├─ 150ms:  Firestore returns 8 listings
├─ 160ms:  Agent decides to format results
├─ 200ms:  Groq API call starts
├─ 720ms:  Groq responds with formatted answer
├─ 730ms:  Response packaged and returned
└─ 750ms:  Mobile app displays AI message

Total: 750ms ✅ Good for AI query!
```

### **RAG Query (Document retrieval path):**
```
User: "What's your cancellation policy?"
├─ 0ms:    User asks question
├─ 15ms:   Intent: "policy_question" → RAG path
├─ 20ms:   Query → embedding (Sentence Transformers)
├─ 70ms:   ChromaDB vector search
├─ 90ms:   Top 3 documents retrieved
├─ 100ms:  Build prompt with context
├─ 150ms:  Groq API call
├─ 680ms:  Groq synthesizes answer from docs
└─ 700ms:  Response displayed

Total: 700ms ✅ Fast + grounded in real docs!
```

---

## 🔄 11. COMPLETE END-TO-END EXAMPLE

### **Scenario: Traveler books a tour**

```
1. USER ACTION: Opens app
   └─→ App.tsx checks AsyncStorage for auth token
       ├─ Token found → Navigate to TravelerHomeScreen
       └─ Token not found → Navigate to OnboardingScreen

2. USER ACTION: Taps "Browse Listings"
   └─→ BrowseListingsScreen.tsx renders
       ├─ useEffect → firestoreService.getAllListings()
       ├─ Firestore query: where status=="approved"
       └─ Display 24 listings in grid

3. USER ACTION: Searches "hiking tours Ella"
   └─→ Search input onChange (debounced 500ms)
       ├─ firestoreService.searchListings({
       │     query: "hiking",
       │     location: "Ella",
       │     category: "tour"
       │   })
       ├─ Firestore: Uses composite index
       └─ Results: 5 listings

4. USER ACTION: Taps on "Ella Hiking Adventure - $45"
   └─→ Navigate to ListingDetailScreen
       ├─ Pass listingId as route param
       ├─ firestoreService.getListing(listingId)
       ├─ firestoreService.getListingReviews(listingId)
       └─ Display: Photos, description, price, reviews

5. USER ACTION: Taps "Book Now"
   └─→ Navigate to BookingScreen
       ├─ Pre-filled: Listing title, price, partner info
       ├─ User selects: Date (DatePicker), # of people
       └─ User adds special request: "Vegetarian lunch"

6. USER ACTION: Taps "Confirm Booking"
   └─→ firestoreService.createBooking({
         listingId: "tour123",
         travelerId: "user456",
         startDate: "2026-03-15",
         numberOfPeople: 2,
         totalPrice: 90,
         status: "pending",
         paymentStatus: "pending"
       })
       ├─ Firestore creates booking document
       ├─ Returns: { bookingId: "booking789" }
       └─ Navigate to payment screen (pending integration)

7. PARTNER SEES: New booking notification
   └─→ PartnerHomeScreen dashboard
       ├─ Real-time listener: onSnapshot(bookings)
       ├─ New booking appears in "Pending" tab
       └─ Partner can confirm/cancel

8. DATA IN FIRESTORE:
   bookings/booking789 = {
     listingId: "tour123",
     listingTitle: "Ella Hiking Adventure",
     travelerId: "user456",
     travelerName: "John Doe",
     partnerId: "partner001",
     status: "pending",
     paymentStatus: "pending",
     totalPrice: 90,
     createdAt: Timestamp(2026-02-16)
   }
```

---

## 🎯 12. KEY TAKEAWAYS

### **What happens when user asks AI a question:**
1. **Intent Classification** (keyword + embedding) → Know what user wants
2. **Role Validation** (RBAC) → Check permissions
3. **Query Routing** → Send to Database OR RAG OR Agent
4. **Execution** → Fetch data or retrieve documents
5. **LLM Provider** (Groq → Gemini fallback) → Format answer
6. **Response** → Display in chat UI

### **Why this architecture is novel:**
- ✅ **Hybrid classification** = Fast + accurate + cheap
- ✅ **Multi-provider LLM** = High uptime without GPT-4 costs
- ✅ **Specialized agents** = Better than generic chatbot
- ✅ **Smart routing** = Use LLM only when needed

### **Components working together:**
```
React Native (UI) 
    ↕
Firebase (Auth + Data + Storage)
    ↕
FastAPI (Backend orchestration)
    ↕
Hybrid AI System (Intent → Route → Execute)
    ↕
LangChain (Agent framework)
    ↕
Groq/Gemini (LLM providers)
    +
ChromaDB (Vector storage)
```

---

**This diagram shows the complete technical workflow from user tap to AI response. Use this to explain your system architecture to your supervisor!**
