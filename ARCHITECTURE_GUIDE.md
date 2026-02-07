# SkyConnectSL Mobile App - Complete Architecture & Data Flow

## Quick Reference

### 📁 **3 Key Documents:**
1. **MOBILE_APP_BACKEND_GUIDE.md** - Complete backend overview
2. **PHASE1_IMPLEMENTATION.md** - Ready-to-use code for immediate implementation  
3. **This file** - Architecture understanding and data flow

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE APP LAYERS                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │          PRESENTATION LAYER (Screens)               │    │
│  │  - OnboardingScreen                                  │    │
│  │  - Login/Signup/EmailVerification                    │    │
│  │  - CreateTravelerProfile / CreatePartnerProfile      │    │
│  │  - TravelerHome / PartnerHome / AdminDashboard      │    │
│  │  - BrowseListings / ListingDetail                   │    │
│  │  - CreateListing / PartnerListings                  │    │
│  └────────────────┬───────────────────────────────────┘    │
│                   │                                          │
│                   │ Uses                                     │
│                   ▼                                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │           BUSINESS LOGIC LAYER                      │    │
│  │  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │ AuthContext  │  │   Services   │               │    │
│  │  │              │  │              │               │    │
│  │  │ - user       │  │ Firestore    │               │    │
│  │  │ - signUp     │  │ Storage      │               │    │
│  │  │ - signIn     │  │              │               │    │
│  │  │ - signOut    │  │              │               │    │
│  │  └──────────────┘  └──────────────┘               │    │
│  └────────────────┬───────────────────────────────────┘    │
│                   │                                          │
│                   │ Talks to                                 │
│                   ▼                                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │              FIREBASE LAYER                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │    │
│  │  │ Auth         │  │ Firestore    │  │ Storage  │ │    │
│  │  │              │  │              │  │          │ │    │
│  │  │ Sign up      │  │ Collections: │  │ Images   │ │    │
│  │  │ Sign in      │  │ - users      │  │ Files    │ │    │
│  │  │ Email verify │  │ - travelers  │  │          │ │    │
│  │  │              │  │ - partners   │  │          │ │    │
│  │  │              │  │ - listings   │  │          │ │    │
│  │  │              │  │ - bookings   │  │          │ │    │
│  │  │              │  │ - favorites  │  │          │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Examples

### Flow 1: User Signup (Traveler)

```
1. User enters email + password on SignupScreen
   └─> Selects role: "Traveler"

2. SignupScreen calls AuthContext.signUp(email, password, 'traveler')
   
3. AuthContext:
   ├─> Creates Firebase Auth user
   ├─> Sends email verification
   └─> Calls firestoreService.createUserDocument()
       └─> Creates document in users/{uid}
           {
             uid: "abc123",
             email: "user@example.com",
             role: "traveler",
             emailVerified: false,
             createdAt: Timestamp,
             updatedAt: Timestamp
           }

4. User redirected to EmailVerificationScreen
   └─> User clicks link in email
   └─> Returns to app
   └─> AuthContext.reloadUser()
       └─> Updates users/{uid} with emailVerified: true

5. User redirected to CreateTravelerProfileScreen
   └─> User fills form + uploads photo
   └─> Calls firestoreService.createTravelerProfile()
       └─> Creates document in travelers/{uid}
           {
             userId: "abc123",
             name: "John Doe",
             email: "user@example.com",
             phoneNumber: "+94XXXXXXXXX",
             profilePhoto: "https://storage.../photo.jpg",
             travelPreferences: ["Beach", "Adventure"],
             budgetRange: { min: 10000, max: 50000 },
             travelType: "Solo",
             createdAt: Timestamp,
             updatedAt: Timestamp
           }

6. User redirected to TravelerHomeScreen ✅
```

---

### Flow 2: Partner Creates Listing

```
1. Partner (already approved) on PartnerHomeScreen
   └─> Clicks "Create Listing"

2. CreateListingScreen opens
   └─> Partner fills form:
       - Title: "Yala Safari Adventure"
       - Category: "Tour"
       - Price: 15000
       - Uploads 5 images
       - etc.

3. On Submit:
   ├─> Step 1: Upload images
   │   └─> storageService.uploadListingImages(partnerId, listingId, imageUris[])
   │       └─> Uploads to: listings/{partnerId}/{listingId}/image_1.jpg
   │       └─> Returns: ["https://storage.../image_1.jpg", ...]
   │
   └─> Step 2: Create listing document
       └─> firestoreService.createListing(listingData)
           └─> Creates document in listings/{listingId}
               {
                 id: "listing123",
                 partnerId: "partner456",
                 partnerName: "Safari Tours SL",
                 title: "Yala Safari Adventure",
                 description: "...",
                 category: "tour",
                 location: "Yala National Park",
                 price: 15000,
                 currency: "LKR",
                 images: [
                   "https://storage.../image_1.jpg",
                   "https://storage.../image_2.jpg",
                   ...
                 ],
                 status: "draft", // or "pending" for review
                 createdAt: Timestamp,
                 updatedAt: Timestamp
               }

4. Redirect back to PartnerListingsScreen
   └─> Shows new listing ✅
```

---

### Flow 3: Traveler Browses & Books Listing

```
1. TravelerHomeScreen loads
   └─> Calls firestoreService.getFeaturedListings()
       └─> Queries: listings where status=='approved' && featured==true
       └─> Returns array of listings

2. Traveler searches "Yala Safari"
   └─> BrowseListingsScreen
       └─> Calls firestoreService.searchListings("Yala Safari")
           └─> Client-side filters titles/descriptions
           └─> Returns matching listings

3. Traveler clicks on listing
   └─> ListingDetailScreen
       ├─> Calls firestoreService.getListingById(listingId)
       │   └─> Returns full listing details
       │
       ├─> Shows images, description, price, etc.
       │
       └─> Traveler clicks "Book Now"
           └─> Creates booking:
               firestoreService.createBooking({
                 listingId: "listing123",
                 listingTitle: "Yala Safari Adventure",
                 travelerId: "traveler789",
                 travelerName: "John Doe",
                 travelerEmail: "john@example.com",
                 partnerId: "partner456",
                 partnerName: "Safari Tours SL",
                 bookingDate: new Date(),
                 startDate: new Date("2026-03-01"),
                 endDate: new Date("2026-03-01"),
                 numberOfPeople: 2,
                 totalPrice: 30000,
                 currency: "LKR",
                 status: "pending",
                 paymentStatus: "pending"
               })
               └─> Creates document in bookings/{bookingId}

4. Booking created ✅
   ├─> Traveler sees confirmation
   ├─> Partner sees new booking in PartnerHomeScreen
   └─> (Future: Send notifications to both)
```

---

### Flow 4: Admin Approves Partner

```
1. New partner signs up
   └─> createPartnerProfile() sets status: "pending"

2. Admin logs in → AdminDashboardScreen
   └─> Calls firestoreService.getPendingPartners()
       └─> Queries: partners where status=='pending'
       └─> Returns array of pending partners

3. Admin reviews partner profile
   ├─> Sees business name, documents, registration, etc.
   │
   └─> Admin clicks "Approve"
       └─> firestoreService.approvePartner(partnerId, adminId)
           └─> Updates partners/{partnerId}
               {
                 status: "approved",
                 approvedAt: Timestamp,
                 approvedBy: "adminUserId",
                 updatedAt: Timestamp
               }

4. Partner can now create listings ✅
   └─> (Future: Send notification to partner)
```

---

## Component → Backend Mapping

| **Screen/Component** | **Firebase Services Used** | **Firestore Collections** | **Storage Paths** |
|---------------------|---------------------------|--------------------------|-------------------|
| **SignupScreen** | Auth | `users/` | None |
| **LoginScreen** | Auth | `users/` | None |
| **EmailVerificationScreen** | Auth | `users/` | None |
| **CreateTravelerProfileScreen** | Firestore, Storage | `travelers/` | `travelers/{userId}/` |
| **EditTravelerProfileScreen** | Firestore, Storage | `travelers/` | `travelers/{userId}/` |
| **CreatePartnerProfileScreen** | Firestore, Storage | `partners/` | `partners/{userId}/` |
| **EditPartnerProfileScreen** | Firestore, Storage | `partners/` | `partners/{userId}/` |
| **TravelerHomeScreen** | Firestore | `listings/`, `bookings/`, `favorites/` | None |
| **PartnerHomeScreen** | Firestore | `partners/`, `listings/`, `bookings/` | None |
| **AdminDashboardScreen** | Firestore | `partners/`, `users/`, `listings/` | None |
| **CreateListingScreen** | Firestore, Storage | `listings/` | `listings/{partnerId}/{listingId}/` |
| **BrowseListingsScreen** | Firestore | `listings/` | None |
| **ListingDetailScreen** | Firestore | `listings/`, `bookings/`, `favorites/` | None |
| **PartnerListingsScreen** | Firestore | `listings/` | None |

---

## Security Rules Reference

### **Firestore Rules (Already Deployed)** ✅

```javascript
// Users - Can read own, admins can update
users/{userId}
  - read: if authenticated
  - create: if authenticated && isOwner
  - update: if isOwner || isAdmin

// Travelers - Can read, owner can create/update
travelers/{userId}
  - read: if authenticated
  - create: if authenticated && isOwner
  - update: if isOwner

// Partners - Can read, owner can create/update, admin can approve
partners/{userId}
  - read: if authenticated
  - create: if authenticated && isOwner
  - update: if isOwner || isAdmin

// Listings - Public read, partner can create/update own
listings/{listingId}
  - read: if true (public)
  - create: if authenticated && request.resource.data.partnerId == request.auth.uid
  - update: if isPartnerOwner || isAdmin
  - delete: if isPartnerOwner || isAdmin

// Bookings - User-specific read/write
bookings/{bookingId}
  - read: if authenticated
  - create: if authenticated
  - update: if authenticated
```

### **Storage Rules (Already Deployed)** ✅

```javascript
// Travelers - Can upload to own folder
travelers/{userId}/{fileName}
  - read: if authenticated
  - write: if authenticated && request.auth.uid == userId

// Partners - Can upload to own folder  
partners/{userId}/{folder}/{fileName}
  - read: if authenticated
  - write: if authenticated && request.auth.uid == userId

// Listings - Partner can upload
listings/{partnerId}/{listingId}/{fileName}
  - read: if authenticated
  - write: if authenticated && request.auth.uid == partnerId
```

---

## What's Already Working ✅

1. **Authentication Flow**
   - Sign up with email/password
   - Login
   - Email verification
   - Role-based access

2. **Profile Management**
   - Create traveler profile
   - Create partner profile (pending approval)
   - Edit profiles
   - Basic profile fields

3. **Listing Management**
   - Create listings
   - View partner's listings
   - Browse all listings
   - Basic CRUD operations

4. **Infrastructure**
   - Firebase project setup
   - Firestore collections
   - Storage buckets
   - Security rules deployed

---

## What to Implement Next ⏳

### **Immediate Priority (Phase 1):**

1. **Image Upload**
   - Profile photos for travelers/partners
   - Logo upload for partners
   - Multiple images for listings
   - Document upload for partner verification

2. **Enhanced Profiles**
   - Add phone number, nationality, DOB to traveler
   - Add logo and documents to partner
   - Photo upload UI in profile screens

3. **Search & Filters**
   - Category filter
   - Price range filter
   - Location search
   - Text search

### **Next Phase (Phase 2):**

1. **Booking System**
   - Create booking flow
   - Booking confirmation
   - View bookings (traveler & partner)
   - Cancel booking

2. **Favorites**
   - Save/unsave listings
   - View favorites list

3. **Admin Approval**
   - Partner approval workflow
   - Listing moderation (optional)

---

## Quick Start Guide

### **To Continue Development:**

1. **Install required packages:**
```bash
npx expo install expo-image-picker expo-file-system
```

2. **Copy code from PHASE1_IMPLEMENTATION.md:**
   - Enhanced `storageService.ts` (image uploads)
   - Additional functions for `firestoreService.ts`
   - Updated type definitions in `types/index.ts`

3. **Update screens to use new services:**
   - Add photo upload to profile creation screens
   - Add image upload to listing creation
   - Add search/filter to browse listings

4. **Test each feature:**
   - Test profile photo upload
   - Test listing image upload
   - Test search and filters
   - Test booking creation

---

## Summary

You now have:

✅ **Complete backend architecture documented**
✅ **All data flows explained**
✅ **Ready-to-use implementation code**
✅ **Clear priorities for next steps**

**Focus on Phase 1** - implementing image uploads and enhanced profiles. This will make your app immediately usable!

**Need help implementing?** I can:
1. Update specific screens with photo upload
2. Implement search/filter UI
3. Create booking flow
4. Build admin approval system

Just let me know what you want to build next! 🚀
