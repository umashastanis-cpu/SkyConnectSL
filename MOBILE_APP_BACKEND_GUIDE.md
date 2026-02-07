# SkyConnectSL Mobile App - Complete Backend Setup Guide 📱

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Firebase Collections Structure](#firebase-collections-structure)
3. [Backend Setup for Each Component](#backend-setup-for-each-component)
4. [Implementation Status](#implementation-status)
5. [Next Steps](#next-steps)

---

## Architecture Overview

```
Mobile App (React Native)
    ↓
Firebase SDK (Client)
    ↓
├── Firebase Authentication
├── Cloud Firestore (Database)
├── Cloud Storage (Images)
└── Cloud Functions (Optional for advanced features)
```

---

## Firebase Collections Structure

### **1. Users Collection** (`users/`)
Stores basic user authentication data and role.

```typescript
users/{userId}
  ├── uid: string
  ├── email: string
  ├── role: 'traveler' | 'partner' | 'admin'
  ├── emailVerified: boolean
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp
```

**Already Implemented:** ✅
- Create user document
- Get user document
- Update email verification

---

### **2. Travelers Collection** (`travelers/`)
Stores traveler-specific profile data.

```typescript
travelers/{userId}
  ├── userId: string
  ├── name: string
  ├── email: string
  ├── phoneNumber: string (MISSING - NEED TO ADD)
  ├── profilePhoto: string (MISSING - NEED TO ADD)
  ├── travelPreferences: string[]
  ├── budgetRange: {
  │     min: number
  │     max: number
  │   }
  ├── travelType: string
  ├── nationality: string (MISSING - NEED TO ADD)
  ├── dateOfBirth: Timestamp (MISSING - NEED TO ADD)
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp
```

**Already Implemented:** ✅
- Create traveler profile
- Get traveler profile
- Update traveler profile

**Need to Add:** ⏳
- Profile photo upload
- Additional fields (phone, nationality, DOB)

---

### **3. Partners Collection** (`partners/`)
Stores partner/business profile data.

```typescript
partners/{userId}
  ├── userId: string
  ├── businessName: string
  ├── businessCategory: string
  ├── description: string
  ├── businessAddress: string
  ├── registrationNumber: string
  ├── email: string
  ├── contactPhone: string
  ├── websiteUrl: string (optional)
  ├── logo: string (MISSING - NEED TO ADD)
  ├── documents: string[] (MISSING - NEED TO ADD)
  ├── status: 'pending' | 'approved' | 'rejected'
  ├── rejectionReason: string (optional)
  ├── approvedAt: Timestamp (optional)
  ├── approvedBy: string (optional - admin userId)
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp
```

**Already Implemented:** ✅
- Create partner profile (auto-set to 'pending')
- Get partner profile
- Update partner profile

**Need to Add:** ⏳
- Logo upload
- Business documents upload
- Admin approval/rejection workflow

---

### **4. Listings Collection** (`listings/`)
Stores service/product listings created by partners.

```typescript
listings/{listingId}
  ├── id: string (auto-generated)
  ├── partnerId: string
  ├── partnerName: string
  ├── title: string
  ├── description: string
  ├── category: 'tour' | 'accommodation' | 'transport' | 'activity'
  ├── location: {
  │     address: string
  │     city: string
  │     coordinates: {
  │       latitude: number
  │       longitude: number
  │     }
  │   }
  ├── price: number
  ├── currency: string
  ├── images: string[]
  ├── amenities: string[]
  ├── maxCapacity: number
  ├── duration: string
  ├── availability: {
  │     startDate: Timestamp
  │     endDate: Timestamp
  │   }
  ├── status: 'draft' | 'pending' | 'approved' | 'rejected'
  ├── tags: string[]
  ├── rating: number (calculated)
  ├── reviewCount: number (calculated)
  ├── featured: boolean (for promoted listings)
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp
```

**Already Implemented:** ✅
- Create listing
- Get listing by ID
- Get partner's listings
- Get all approved listings
- Update listing
- Delete listing

**Need to Add:** ⏳
- Image upload for listings
- Search and filter functionality
- Featured/promoted listings

---

### **5. Bookings Collection** (`bookings/`) ⏳ NOT IMPLEMENTED
User bookings for listings.

```typescript
bookings/{bookingId}
  ├── id: string
  ├── listingId: string
  ├── listingTitle: string
  ├── travelerId: string
  ├── travelerName: string
  ├── travelerEmail: string
  ├── partnerId: string
  ├── partnerName: string
  ├── bookingDate: Timestamp
  ├── startDate: Timestamp
  ├── endDate: Timestamp
  ├── numberOfPeople: number
  ├── totalPrice: number
  ├── currency: string
  ├── status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  ├── paymentStatus: 'pending' | 'paid' | 'refunded'
  ├── paymentMethod: string
  ├── specialRequests: string
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp
```

**Implementation Needed:** ❌
- Create booking
- Get traveler's bookings
- Get partner's bookings
- Update booking status
- Cancel booking

---

### **6. Reviews Collection** (`reviews/`) ⏳ NOT IMPLEMENTED
Reviews and ratings for listings.

```typescript
reviews/{reviewId}
  ├── id: string
  ├── listingId: string
  ├── travelerId: string
  ├── travelerName: string
  ├── rating: number (1-5)
  ├── comment: string
  ├── images: string[] (optional)
  ├── response: {
  │     text: string
  │     respondedAt: Timestamp
  │   } (partner response)
  ├── helpful: number (upvotes)
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp
```

**Implementation Needed:** ❌
- Create review
- Get listing reviews
- Update review
- Delete review
- Partner response to review

---

### **7. Favorites Collection** (`favorites/`) ⏳ NOT IMPLEMENTED
User's saved/favorited listings.

```typescript
favorites/{favoriteId}
  ├── userId: string
  ├── listingId: string
  ├── listingTitle: string
  ├── listingImage: string
  ├── price: number
  └── createdAt: Timestamp
```

**Implementation Needed:** ❌
- Add to favorites
- Remove from favorites
- Get user's favorites

---

### **8. Notifications Collection** (`notifications/`) ⏳ NOT IMPLEMENTED
In-app notifications for users.

```typescript
notifications/{notificationId}
  ├── userId: string
  ├── type: 'booking' | 'approval' | 'review' | 'message'
  ├── title: string
  ├── message: string
  ├── read: boolean
  ├── actionUrl: string (optional)
  ├── data: object (additional data)
  └── createdAt: Timestamp
```

**Implementation Needed:** ❌
- Create notification
- Get user notifications
- Mark as read
- Delete notification

---

### **9. Messages/Chat Collection** (`chats/`) ⏳ NOT IMPLEMENTED
Direct messaging between travelers and partners.

```typescript
chats/{chatId}
  ├── id: string
  ├── participants: [userId1, userId2]
  ├── participantDetails: {
  │     [userId]: {
  │       name: string
  │       role: string
  │       photo: string
  │     }
  │   }
  ├── lastMessage: {
  │     text: string
  │     senderId: string
  │     timestamp: Timestamp
  │   }
  ├── unreadCount: {
  │     [userId]: number
  │   }
  └── updatedAt: Timestamp

  messages (subcollection)
    └── messages/{messageId}
        ├── id: string
        ├── senderId: string
        ├── text: string
        ├── images: string[]
        ├── read: boolean
        └── createdAt: Timestamp
```

**Implementation Needed:** ❌
- Create/get chat
- Send message
- Get messages
- Mark messages as read
- Real-time message updates

---

## Backend Setup for Each Component

### **1. Authentication Flow Components**

#### **OnboardingScreen.tsx**
**Backend Required:** None (UI only)

#### **SignupScreen.tsx**
**Backend Functions:**
```typescript
// services/firestoreService.ts
✅ createUserDocument(uid, email, role, emailVerified)
```

**Implementation:**
- Already done
- Creates user document in Firestore after Firebase Auth signup
- Sets initial role and email verification status

#### **LoginScreen.tsx**
**Backend Functions:**
```typescript
// Firebase Auth only - no additional backend
✅ signInWithEmailAndPassword()
✅ getUserDocument() - to get user role
```

**Implementation:**
- Already done
- Uses Firebase Authentication
- Fetches user role from Firestore after login

#### **EmailVerificationScreen.tsx**
**Backend Functions:**
```typescript
✅ sendEmailVerification()
✅ updateUserEmailVerification(uid)
```

**Implementation:**
- Already done
- Sends verification email via Firebase
- Updates Firestore when verified

---

### **2. Profile Management Components**

#### **CreateTravelerProfileScreen.tsx**
**Backend Functions:**
```typescript
✅ createTravelerProfile(profile)
```

**Current Implementation:**
```typescript
const createTravelerProfile = async (
  profile: Omit<TravelerProfile, 'createdAt' | 'updatedAt'>
): Promise<void> => {
  const travelerRef = doc(db, 'travelers', profile.userId);
  await setDoc(travelerRef, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};
```

**Needs Enhancement:**
- ✅ Basic profile creation works
- ⏳ Add profile photo upload
- ⏳ Add phone number field
- ⏳ Add nationality field
- ⏳ Add date of birth field

#### **EditTravelerProfileScreen.tsx**
**Backend Functions:**
```typescript
✅ getTravelerProfile(userId)
✅ updateTravelerProfile(userId, updates)
```

**Implementation:** Already done

#### **CreatePartnerProfileScreen.tsx**
**Backend Functions:**
```typescript
✅ createPartnerProfile(profile)
```

**Current Implementation:**
```typescript
const createPartnerProfile = async (
  profile: Omit<PartnerProfile, 'createdAt' | 'updatedAt' | 'status'>
): Promise<void> => {
  const partnerRef = doc(db, 'partners', profile.userId);
  await setDoc(partnerRef, {
    ...profile,
    status: 'pending', // Auto-set to pending approval
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};
```

**Needs Enhancement:**
- ✅ Basic profile creation works
- ⏳ Add logo upload
- ⏳ Add business document upload (registration, license)
- ⏳ Add multiple categories support

#### **EditPartnerProfileScreen.tsx**
**Backend Functions:**
```typescript
✅ getPartnerProfile(userId)
✅ updatePartnerProfile(userId, updates)
```

**Implementation:** Already done

---

### **3. Listing Management Components**

#### **CreateListingScreen.tsx**
**Backend Functions:**
```typescript
✅ createListing(listing)
⏳ uploadListingImages(userId, images)
```

**Current Implementation:**
```typescript
const createListing = async (
  listing: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const listingsRef = collection(db, 'listings');
  const docRef = await addDoc(listingsRef, {
    ...listing,
    status: 'draft',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};
```

**Needs Enhancement:**
- ✅ Basic listing creation works
- ⏳ Image upload to Firebase Storage
- ⏳ Multiple image support
- ⏳ Location picker (map integration)
- ⏳ Availability calendar

#### **PartnerListingsScreen.tsx**
**Backend Functions:**
```typescript
✅ getPartnerListings(partnerId)
✅ deleteListing(listingId)
```

**Implementation:** Already done

#### **BrowseListingsScreen.tsx**
**Backend Functions:**
```typescript
✅ getApprovedListings()
⏳ searchListings(query, filters)
⏳ getListingsByCategory(category)
⏳ getFeaturedListings()
```

**Current Implementation:**
```typescript
const getApprovedListings = async (): Promise<Listing[]> => {
  const listingsRef = collection(db, 'listings');
  const q = query(
    listingsRef,
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(convertListingDoc);
};
```

**Needs to Add:**
```typescript
// Search with filters
const searchListings = async (
  searchQuery?: string,
  category?: ListingCategory,
  minPrice?: number,
  maxPrice?: number,
  location?: string
): Promise<Listing[]> => {
  // Implementation needed
};

// Get by category
const getListingsByCategory = async (
  category: ListingCategory
): Promise<Listing[]> => {
  // Implementation needed
};
```

#### **ListingDetailScreen.tsx**
**Backend Functions:**
```typescript
✅ getListingById(listingId)
⏳ getListingReviews(listingId)
⏳ addToFavorites(userId, listingId)
⏳ createBooking(bookingData)
```

**Implementation:** Only listing fetch is done

---

### **4. Home/Dashboard Components**

#### **TravelerHomeScreen.tsx**
**Backend Functions Needed:**
```typescript
⏳ getFeaturedListings()
⏳ getRecentListings()
⏳ getUserBookings(userId)
⏳ getUserFavorites(userId)
⏳ getRecommendedListings(userId)
```

**Implementation:** ❌ None implemented yet

#### **PartnerHomeScreen.tsx**
**Backend Functions Needed:**
```typescript
✅ getPartnerProfile(userId) - Already done
✅ getPartnerListings(userId) - Already done
⏳ getPartnerBookings(userId)
⏳ getPartnerStats(userId) // revenue, bookings count, etc.
⏳ getPartnerReviews(userId)
```

**Partial Implementation:** Profile and listings done

#### **AdminDashboardScreen.tsx**
**Backend Functions Needed:**
```typescript
⏳ getPendingPartners()
⏳ approvePartner(partnerId)
⏳ rejectPartner(partnerId, reason)
⏳ getPendingListings()
⏳ approveListing(listingId)
⏳ rejectListing(listingId, reason)
⏳ getAllUsers()
⏳ getPlatformStats()
```

**Implementation:** ❌ None implemented yet

---

## Implementation Priority

### **Phase 1: Essential Features (CURRENT - Focus Here)** 🎯

1. **Image Upload Service**
   - Profile photos (travelers & partners)
   - Listing images
   - Business documents

2. **Enhanced Profile Management**
   - Add missing fields to traveler/partner types
   - Photo upload integration
   - Document upload for partners

3. **Listing Search & Filters**
   - Category filter
   - Price range filter
   - Location search
   - Text search

### **Phase 2: Booking System** 📅

1. **Booking Collection & Functions**
   - Create booking
   - Booking confirmation
   - Booking history
   - Cancel booking

2. **Payment Integration** (Optional)
   - Stripe or PayPal
   - Payment status tracking

### **Phase 3: Social Features** ⭐

1. **Reviews & Ratings**
   - Submit review
   - View reviews
   - Partner responses
   - Rating calculation

2. **Favorites/Wishlist**
   - Save listings
   - Remove from favorites
   - View favorites

### **Phase 4: Communication** 💬

1. **Notifications**
   - Push notifications
   - In-app notifications
   - Email notifications

2. **Chat System**
   - Direct messaging
   - Real-time chat
   - Image sharing in chat

### **Phase 5: Admin Features** 👑

1. **Partner Approval System**
   - Review pending partners
   - Approve/Reject
   - Send notifications

2. **Listing Moderation**
   - Review listings
   - Approve/Reject
   - Content moderation

3. **Analytics Dashboard**
   - User statistics
   - Revenue tracking
   - Popular listings

---

## Next Immediate Steps

### **Step 1: Complete Image Upload Service** ⏳

Create `src/services/storageService.ts` (enhance existing):

```typescript
// Upload traveler profile photo
export const uploadTravelerProfilePhoto = async (
  userId: string,
  imageUri: string
): Promise<string> => {
  // Implementation in next step
};

// Upload partner logo
export const uploadPartnerLogo = async (
  userId: string,
  imageUri: string
): Promise<string> => {
  // Implementation in next step
};

// Upload listing images
export const uploadListingImages = async (
  listingId: string,
  images: string[]
): Promise<string[]> => {
  // Implementation in next step
};

// Upload partner documents
export const uploadPartnerDocuments = async (
  userId: string,
  documents: { name: string; uri: string }[]
): Promise<string[]> => {
  // Implementation in next step
};
```

### **Step 2: Enhance firestoreService.ts** ⏳

Add these functions:

```typescript
// Bookings
export const createBooking = async (bookingData) => { ... }
export const getUserBookings = async (userId) => { ... }
export const getPartnerBookings = async (partnerId) => { ... }
export const updateBookingStatus = async (bookingId, status) => { ... }
export const cancelBooking = async (bookingId) => { ... }

// Reviews
export const createReview = async (reviewData) => { ... }
export const getListingReviews = async (listingId) => { ... }
export const updateReviewRating = async (listingId) => { ... }

// Favorites
export const addToFavorites = async (userId, listingId) => { ... }
export const removeFromFavorites = async (userId, listingId) => { ... }
export const getUserFavorites = async (userId) => { ... }

// Search & Filter
export const searchListings = async (filters) => { ... }
export const getListingsByCategory = async (category) => { ... }
export const getFeaturedListings = async () => { ... }

// Admin
export const getPendingPartners = async () => { ... }
export const approvePartner = async (partnerId) => { ... }
export const rejectPartner = async (partnerId, reason) => { ... }
```

### **Step 3: Update TypeScript Types** ⏳

Enhance `src/types/index.ts`:

```typescript
// Add missing fields to TravelerProfile
export interface TravelerProfile {
  userId: string;
  name: string;
  email: string;
  phoneNumber: string; // NEW
  profilePhoto?: string; // NEW
  nationality?: string; // NEW
  dateOfBirth?: Date; // NEW
  travelPreferences: string[];
  budgetRange: { min: number; max: number };
  travelType: string;
  createdAt: Date;
  updatedAt: Date;
}

// Add to PartnerProfile
export interface PartnerProfile {
  // ... existing fields
  logo?: string; // NEW
  documents?: string[]; // NEW
  approvedAt?: Date; // NEW
  approvedBy?: string; // NEW
}

// Add new interfaces
export interface Booking { ... }
export interface Review { ... }
export interface Favorite { ... }
export interface Notification { ... }
```

---

## Summary

✅ **Already Working:**
- Authentication (signup, login, email verification)
- User document management
- Traveler profile CRUD
- Partner profile CRUD
- Basic listing CRUD
- Browse approved listings

⏳ **Next to Implement (Priority):**
1. Image upload service
2. Enhanced profiles with photos
3. Listing search and filters
4. Booking system
5. Admin approval workflow

❌ **Not Started Yet:**
- Reviews and ratings
- Favorites
- Notifications
- Chat/messaging
- Payment integration
- Advanced analytics

Focus on completing **Phase 1** first - this will make your app functional for basic use!
