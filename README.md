# SkyConnect SL - Mobile App 📱

Travel marketplace connecting travelers with local partners in Sri Lanka.

> **Note:** The website has been moved to a separate repository:  
> 🌐 **[SkyConnectSL-Website](https://github.com/umashastanis-cpu/SkyConnectSL-Website)**

This repository contains the **React Native mobile application**.

## Sprint 1 Features ✅

- ✅ Onboarding carousel (4 slides)
- ✅ Email/password authentication
- ✅ Email verification
- ✅ Role-based signup (Traveler/Partner)
- ✅ Traveler profile creation & management
- ✅ Partner profile creation (pending approval)
- ✅ Firebase Firestore integration
- ✅ Role-based navigation

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Navigation**: React Navigation (Native Stack)
- **Storage**: AsyncStorage

## Project Structure

```
SkyConnectSL/
├── src/
│   ├── config/
│   │   └── firebase.ts          # Firebase initialization
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication state
│   ├── navigation/
│   │   └── AppNavigator.tsx     # App navigation logic
│   ├── screens/
│   │   ├── OnboardingScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── EmailVerificationScreen.tsx
│   │   ├── CreateTravelerProfileScreen.tsx
│   │   ├── CreatePartnerProfileScreen.tsx
│   │   ├── TravelerHomeScreen.tsx
│   │   └── PartnerHomeScreen.tsx
│   ├── services/
│   │   └── firestoreService.ts  # Firestore CRUD operations
│   └── types/
│       └── index.ts              # TypeScript interfaces
├── App.tsx
├── .env                          # Firebase config (DO NOT COMMIT)
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

Already installed! If you need to reinstall:

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project: **SkyConnect-SL**
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database** → Start in test mode
5. Add a Web App and copy your config

### 3. Update .env File

Edit `.env` with your Firebase credentials:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

### 4. Run the App

```bash
npx expo start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app on your phone

## Firestore Collections

### `users`
```typescript
{
  uid: string
  email: string
  role: 'traveler' | 'partner'
  emailVerified: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

### `travelers`
```typescript
{
  userId: string
  name: string
  email: string
  travelPreferences: string[]
  budgetRange: { min: number, max: number }
  travelType: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### `partners`
```typescript
{
  userId: string
  companyName: string
  description: string
  location: string
  contactInfo: { phone, email, website? }
  status: 'pending' | 'approved' | 'rejected'
  createdAt: timestamp
  updatedAt: timestamp
}
```

## User Flow

1. **First Launch** → Onboarding (4 slides)
2. **Sign Up** → Choose role (Traveler/Partner) → Create account
3. **Email Verification** → Verify email
4. **Profile Creation**:
   - Traveler: Name, preferences, budget, travel type
   - Partner: Company info, description, location, contact
5. **Home Screen**:
   - Traveler: Browse listings (Sprint 2)
   - Partner: Manage listings (Sprint 2)

## Next Sprint (Sprint 2)

- [ ] Partner listings (hotels, tours, activities)
- [ ] Traveler browse/search functionality
- [ ] Listing details view
- [ ] Image uploads
- [ ] Filters and sorting

## Sprint 1 Constraints

- ❌ No booking system
- ❌ No payments
- ❌ No AI features
- ❌ No messaging
- ✅ Foundation only

## Development Commands

```bash
# Start development server
npx expo start

# Clear cache
npx expo start -c

# Check for errors
npm run tsc

# Install new package
npm install package-name
```

## Notes

- Partners need admin approval before publishing listings
- All profiles stored in Firestore
- Onboarding shown only once (AsyncStorage)
- Email verification required before profile creation

---

**Sprint 1 Status**: ✅ Complete
**Next Up**: Sprint 2 - Listings & Discovery
