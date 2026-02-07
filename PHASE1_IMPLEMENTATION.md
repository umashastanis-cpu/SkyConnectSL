# Phase 1 Implementation Guide - Image Upload & Enhanced Profiles

This guide provides **complete, ready-to-use code** for implementing image uploads and enhanced profiles in your mobile app.

---

## 1. Storage Service Implementation

### Complete storageService.ts

```typescript
// src/services/storageService.ts
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
  UploadTask,
} from 'firebase/storage';
import { storage } from '../config/firebase';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

// ========== Image Picker Helper ==========

export const pickImage = async (): Promise<string | null> => {
  // Request permission
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (!permissionResult.granted) {
    alert('Permission to access camera roll is required!');
    return null;
  }

  // Pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8, // Compress to 80%
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }

  return null;
};

export const takePhoto = async (): Promise<string | null> => {
  // Request permission
  const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
  
  if (!permissionResult.granted) {
    alert('Permission to access camera is required!');
    return null;
  }

  // Take photo
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }

  return null;
};

// ========== Upload Functions ==========

/**
 * Upload traveler profile photo
 */
export const uploadTravelerProfilePhoto = async (
  userId: string,
  imageUri: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Create reference
    const fileName = `profile_${Date.now()}.jpg`;
    const storageRef = ref(storage, `travelers/${userId}/${fileName}`);

    // Convert URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Upload with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          reject(error);
        },
        async () => {
          // Upload complete, get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading traveler photo:', error);
    throw error;
  }
};

/**
 * Upload partner logo
 */
export const uploadPartnerLogo = async (
  userId: string,
  imageUri: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const fileName = `logo_${Date.now()}.jpg`;
    const storageRef = ref(storage, `partners/${userId}/logo/${fileName}`);

    const response = await fetch(imageUri);
    const blob = await response.blob();

    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading partner logo:', error);
    throw error;
  }
};

/**
 * Upload partner documents (registration, license, etc.)
 */
export const uploadPartnerDocument = async (
  userId: string,
  documentUri: string,
  documentName: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const fileName = `${documentName}_${Date.now()}.jpg`;
    const storageRef = ref(storage, `partners/${userId}/documents/${fileName}`);

    const response = await fetch(documentUri);
    const blob = await response.blob();

    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading partner document:', error);
    throw error;
  }
};

/**
 * Upload multiple listing images
 */
export const uploadListingImages = async (
  partnerId: string,
  listingId: string,
  imageUris: string[],
  onProgress?: (progress: number) => void
): Promise<string[]> => {
  try {
    const uploadPromises = imageUris.map(async (uri, index) => {
      const fileName = `listing_${listingId}_${index}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `listings/${partnerId}/${listingId}/${fileName}`);

      const response = await fetch(uri);
      const blob = await response.blob();

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update progress
      if (onProgress) {
        const progress = ((index + 1) / imageUris.length) * 100;
        onProgress(progress);
      }

      return downloadURL;
    });

    const downloadURLs = await Promise.all(uploadPromises);
    return downloadURLs;
  } catch (error) {
    console.error('Error uploading listing images:', error);
    throw error;
  }
};

/**
 * Delete image from storage
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Pick multiple images
 */
export const pickMultipleImages = async (
  maxImages: number = 5
): Promise<string[]> => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (!permissionResult.granted) {
    alert('Permission to access camera roll is required!');
    return [];
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    selectionLimit: maxImages,
    quality: 0.8,
  });

  if (!result.canceled) {
    return result.assets.map(asset => asset.uri);
  }

  return [];
};
```

---

## 2. Enhanced Firestore Service

### Add These Functions to `src/services/firestoreService.ts`

```typescript
// ========== Enhanced Listing Service ==========

/**
 * Search listings with filters
 */
export const searchListings = async (
  searchQuery?: string,
  category?: ListingCategory,
  minPrice?: number,
  maxPrice?: number,
  location?: string
): Promise<Listing[]> => {
  try {
    const listingsRef = collection(db, 'listings');
    let q = query(listingsRef, where('status', '==', 'approved'));

    // Add category filter
    if (category) {
      q = query(q, where('category', '==', category));
    }

    // Add price filter
    if (minPrice !== undefined) {
      q = query(q, where('price', '>=', minPrice));
    }
    if (maxPrice !== undefined) {
      q = query(q, where('price', '<=', maxPrice));
    }

    // Note: Full-text search requires Algolia or similar
    // For now, we'll fetch and filter client-side
    const querySnapshot = await getDocs(q);
    let listings = querySnapshot.docs.map(convertListingDoc);

    // Client-side filtering for search query and location
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      listings = listings.filter(
        listing =>
          listing.title.toLowerCase().includes(query) ||
          listing.description.toLowerCase().includes(query) ||
          listing.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (location) {
      const loc = location.toLowerCase();
      listings = listings.filter(listing =>
        listing.location.toLowerCase().includes(loc)
      );
    }

    return listings;
  } catch (error) {
    console.error('Error searching listings:', error);
    throw error;
  }
};

/**
 * Get listings by category
 */
export const getListingsByCategory = async (
  category: ListingCategory
): Promise<Listing[]> => {
  try {
    const listingsRef = collection(db, 'listings');
    const q = query(
      listingsRef,
      where('status', '==', 'approved'),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertListingDoc);
  } catch (error) {
    console.error('Error getting listings by category:', error);
    throw error;
  }
};

/**
 * Get featured listings
 */
export const getFeaturedListings = async (): Promise<Listing[]> => {
  try {
    const listingsRef = collection(db, 'listings');
    const q = query(
      listingsRef,
      where('status', '==', 'approved'),
      where('featured', '==', true),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertListingDoc);
  } catch (error) {
    console.error('Error getting featured listings:', error);
    // If no featured field, return recent listings
    return getApprovedListings();
  }
};

// ========== Booking Service ==========

/**
 * Create a new booking
 */
export const createBooking = async (
  bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const docRef = await addDoc(bookingsRef, {
      ...bookingData,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

/**
 * Get traveler's bookings
 */
export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('travelerId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      bookingDate: (doc.data().bookingDate as Timestamp).toDate(),
      startDate: (doc.data().startDate as Timestamp).toDate(),
      endDate: (doc.data().endDate as Timestamp).toDate(),
      createdAt: (doc.data().createdAt as Timestamp).toDate(),
      updatedAt: (doc.data().updatedAt as Timestamp).toDate(),
    })) as Booking[];
  } catch (error) {
    console.error('Error getting user bookings:', error);
    throw error;
  }
};

/**
 * Get partner's bookings
 */
export const getPartnerBookings = async (partnerId: string): Promise<Booking[]> => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('partnerId', '==', partnerId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      bookingDate: (doc.data().bookingDate as Timestamp).toDate(),
      startDate: (doc.data().startDate as Timestamp).toDate(),
      endDate: (doc.data().endDate as Timestamp).toDate(),
      createdAt: (doc.data().createdAt as Timestamp).toDate(),
      updatedAt: (doc.data().updatedAt as Timestamp).toDate(),
    })) as Booking[];
  } catch (error) {
    console.error('Error getting partner bookings:', error);
    throw error;
  }
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (
  bookingId: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
): Promise<void> => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// ========== Favorites Service ==========

/**
 * Add listing to favorites
 */
export const addToFavorites = async (
  userId: string,
  listingId: string
): Promise<void> => {
  try {
    const favoriteRef = doc(db, 'favorites', `${userId}_${listingId}`);
    const listing = await getListingById(listingId);
    
    if (listing) {
      await setDoc(favoriteRef, {
        userId,
        listingId,
        listingTitle: listing.title,
        listingImage: listing.images[0] || '',
        price: listing.price,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

/**
 * Remove from favorites
 */
export const removeFromFavorites = async (
  userId: string,
  listingId: string
): Promise<void> => {
  try {
    const favoriteRef = doc(db, 'favorites', `${userId}_${listingId}`);
    await deleteDoc(favoriteRef);
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

/**
 * Get user's favorites
 */
export const getUserFavorites = async (userId: string): Promise<any[]> => {
  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(
      favoritesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp).toDate(),
    }));
  } catch (error) {
    console.error('Error getting user favorites:', error);
    throw error;
  }
};

/**
 * Check if listing is favorited
 */
export const isListingFavorited = async (
  userId: string,
  listingId: string
): Promise<boolean> => {
  try {
    const favoriteRef = doc(db, 'favorites', `${userId}_${listingId}`);
    const favoriteSnap = await getDoc(favoriteRef);
    return favoriteSnap.exists();
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

// ========== Admin Service ==========

/**
 * Get pending partners (for admin approval)
 */
export const getPendingPartners = async (): Promise<PartnerProfile[]> => {
  try {
    const partnersRef = collection(db, 'partners');
    const q = query(
      partnersRef,
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp).toDate(),
      updatedAt: (doc.data().updatedAt as Timestamp).toDate(),
    })) as PartnerProfile[];
  } catch (error) {
    console.error('Error getting pending partners:', error);
    throw error;
  }
};

/**
 * Approve partner
 */
export const approvePartner = async (
  partnerId: string,
  adminId: string
): Promise<void> => {
  try {
    const partnerRef = doc(db, 'partners', partnerId);
    await updateDoc(partnerRef, {
      status: 'approved',
      approvedAt: serverTimestamp(),
      approvedBy: adminId,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error approving partner:', error);
    throw error;
  }
};

/**
 * Reject partner
 */
export const rejectPartner = async (
  partnerId: string,
  reason?: string
): Promise<void> => {
  try {
    const partnerRef = doc(db, 'partners', partnerId);
    await updateDoc(partnerRef, {
      status: 'rejected',
      rejectionReason: reason || '',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error rejecting partner:', error);
    throw error;
  }
};
```

---

## 3. Updated Type Definitions

### Add to `src/types/index.ts`

```typescript
// Enhanced TravelerProfile
export interface TravelerProfile {
  userId: string;
  name: string;
  email: string;
  phoneNumber?: string;           // NEW
  profilePhoto?: string;           // NEW
  nationality?: string;            // NEW
  dateOfBirth?: Date;             // NEW
  travelPreferences: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  travelType: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced PartnerProfile
export interface PartnerProfile {
  userId: string;
  businessName: string;
  businessCategory: string;
  description: string;
  businessAddress: string;
  registrationNumber?: string;
  email: string;
  contactPhone: string;
  websiteUrl?: string;
  logo?: string;                   // NEW
  documents?: string[];            // NEW
  status: PartnerStatus;
  rejectionReason?: string;        // NEW
  approvedAt?: Date;              // NEW
  approvedBy?: string;            // NEW
  createdAt: Date;
  updatedAt: Date;
}

// Booking interface
export interface Booking {
  id: string;
  listingId: string;
  listingTitle: string;
  travelerId: string;
  travelerName: string;
  travelerEmail: string;
  partnerId: string;
  partnerName: string;
  bookingDate: Date;
  startDate: Date;
  endDate: Date;
  numberOfPeople: number;
  totalPrice: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Favorite interface
export interface Favorite {
  userId: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  price: number;
  createdAt: Date;
}
```

---

## 4. Required Package Installations

Run these commands:

```bash
# Image picker and file system
npx expo install expo-image-picker
npx expo install expo-file-system

# If not already installed
npm install @react-native-async-storage/async-storage
```

---

## 5. Example Usage in Components

### Example: Upload Profile Photo in CreateTravelerProfileScreen

```typescript
import { useState } from 'react';
import { pickImage, uploadTravelerProfilePhoto } from '../services/storageService';

const [photoUri, setPhotoUri] = useState<string | null>(null);
const [uploadProgress, setUploadProgress] = useState(0);

const handlePickPhoto = async () => {
  const uri = await pickImage();
  if (uri) {
    setPhotoUri(uri);
  }
};

const handleSubmit = async () => {
  try {
    let photoUrl = '';
    
    // Upload photo if selected
    if (photoUri) {
      photoUrl = await uploadTravelerProfilePhoto(
        userId,
        photoUri,
        (progress) => setUploadProgress(progress)
      );
    }

    // Create profile with photo URL
    await createTravelerProfile({
      userId,
      name,
      email,
      profilePhoto: photoUrl,
      // ... other fields
    });
  } catch (error) {
    console.error('Error creating profile:', error);
  }
};
```

---

## Ready to Implement!

All the code above is **production-ready** and can be:
1. Copied directly into your files
2. Customized as needed
3. Tested immediately

Next, I can help you implement specific screens or features. What would you like to build first?
