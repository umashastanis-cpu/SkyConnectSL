import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { TravelerProfile, PartnerProfile, User, UserRole, Listing, ListingStatus, ListingCategory } from '../types';

// ========== User Service ==========

export const createUserDocument = async (
  uid: string,
  email: string,
  role: UserRole,
  emailVerified: boolean
): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    uid,
    email,
    role,
    emailVerified,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getUserDocument = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    } as User;
  }

  return null;
};

export const updateUserEmailVerification = async (uid: string): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    emailVerified: true,
    updatedAt: serverTimestamp(),
  });
};

// ========== Traveler Profile Service ==========

export const createTravelerProfile = async (
  profile: Omit<TravelerProfile, 'createdAt' | 'updatedAt'>
): Promise<void> => {
  const travelerRef = doc(db, 'travelers', profile.userId);
  await setDoc(travelerRef, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getTravelerProfile = async (
  userId: string
): Promise<TravelerProfile | null> => {
  const travelerRef = doc(db, 'travelers', userId);
  const travelerSnap = await getDoc(travelerRef);

  if (travelerSnap.exists()) {
    const data = travelerSnap.data();
    return {
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    } as TravelerProfile;
  }

  return null;
};

export const updateTravelerProfile = async (
  userId: string,
  updates: Partial<Omit<TravelerProfile, 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const travelerRef = doc(db, 'travelers', userId);
  await updateDoc(travelerRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// ========== Partner Profile Service ==========

export const createPartnerProfile = async (
  profile: Omit<PartnerProfile, 'createdAt' | 'updatedAt' | 'status'>
): Promise<void> => {
  const partnerRef = doc(db, 'partners', profile.userId);
  const profileData = {
    ...profile,
    status: 'pending' as const, // Partners need admin approval
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  console.log('Creating partner profile:', profileData);
  await setDoc(partnerRef, profileData);
  console.log('Partner profile created successfully');
};

export const getPartnerProfile = async (
  userId: string
): Promise<PartnerProfile | null> => {
  const partnerRef = doc(db, 'partners', userId);
  const partnerSnap = await getDoc(partnerRef);

  if (partnerSnap.exists()) {
    const data = partnerSnap.data();
    return {
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    } as PartnerProfile;
  }

  return null;
};

export const updatePartnerProfile = async (
  userId: string,
  updates: Partial<Omit<PartnerProfile, 'userId' | 'createdAt' | 'updatedAt' | 'status'>>
): Promise<void> => {
  const partnerRef = doc(db, 'partners', userId);
  await updateDoc(partnerRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// Admin function to approve partner
export const approvePartner = async (
  userId: string,
  adminId: string
): Promise<void> => {
  const partnerRef = doc(db, 'partners', userId);
  await updateDoc(partnerRef, {
    status: 'approved',
    approvedAt: serverTimestamp(),
    approvedBy: adminId,
    updatedAt: serverTimestamp(),
  });
};

// Admin function to reject partner
export const rejectPartner = async (
  userId: string,
  reason?: string
): Promise<void> => {
  const partnerRef = doc(db, 'partners', userId);
  await updateDoc(partnerRef, {
    status: 'rejected',
    rejectionReason: reason || '',
    updatedAt: serverTimestamp(),
  });
};

// Get all partners (admin only)
export const getAllPartners = async (): Promise<PartnerProfile[]> => {
  const partnersRef = collection(db, 'partners');
  const querySnapshot = await getDocs(partnersRef);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      userId: doc.id,
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    } as PartnerProfile;
  });
};

// Get pending partners (admin only)
export const getPendingPartners = async (): Promise<PartnerProfile[]> => {
  const partnersRef = collection(db, 'partners');
  const q = query(partnersRef, where('status', '==', 'pending'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      userId: doc.id,
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    } as PartnerProfile;
  });
};

// ========== Listing Service ==========

export const createListing = async (
  listing: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<string> => {
  const listingsRef = collection(db, 'listings');
  const listingData = {
    ...listing,
    status: 'pending' as ListingStatus, // Default status for new listings
    availability: {
      startDate: Timestamp.fromDate(listing.availability.startDate),
      endDate: Timestamp.fromDate(listing.availability.endDate),
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(listingsRef, listingData);
  return docRef.id;
};

export const getListing = async (listingId: string): Promise<Listing | null> => {
  const listingRef = doc(db, 'listings', listingId);
  const listingSnap = await getDoc(listingRef);

  if (listingSnap.exists()) {
    const data = listingSnap.data();
    return {
      id: listingSnap.id,
      ...data,
      availability: {
        startDate: (data.availability.startDate as Timestamp).toDate(),
        endDate: (data.availability.endDate as Timestamp).toDate(),
      },
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    } as Listing;
  }

  return null;
};

export const getPartnerListings = async (partnerId: string): Promise<Listing[]> => {
  const listingsRef = collection(db, 'listings');
  const q = query(listingsRef, where('partnerId', '==', partnerId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      availability: {
        startDate: (data.availability.startDate as Timestamp).toDate(),
        endDate: (data.availability.endDate as Timestamp).toDate(),
      },
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    } as Listing;
  });
};

export const getApprovedListings = async (
  category?: ListingCategory
): Promise<Listing[]> => {
  const listingsRef = collection(db, 'listings');
  let q;
  
  if (category) {
    q = query(
      listingsRef,
      where('status', '==', 'approved'),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(
      listingsRef,
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
  }

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      availability: {
        startDate: (data.availability.startDate as Timestamp).toDate(),
        endDate: (data.availability.endDate as Timestamp).toDate(),
      },
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    } as Listing;
  });
};

export const updateListing = async (
  listingId: string,
  updates: Partial<Omit<Listing, 'id' | 'partnerId' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const listingRef = doc(db, 'listings', listingId);
  const updateData: any = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  // Convert dates if availability is being updated
  if (updates.availability) {
    updateData.availability = {
      startDate: Timestamp.fromDate(updates.availability.startDate),
      endDate: Timestamp.fromDate(updates.availability.endDate),
    };
  }

  await updateDoc(listingRef, updateData);
};

export const deleteListing = async (listingId: string): Promise<void> => {
  const listingRef = doc(db, 'listings', listingId);
  await deleteDoc(listingRef);
};

// Admin function to approve listing
export const approveListing = async (listingId: string): Promise<void> => {
  const listingRef = doc(db, 'listings', listingId);
  await updateDoc(listingRef, {
    status: 'approved',
    updatedAt: serverTimestamp(),
  });
};

// Admin function to reject listing
export const rejectListing = async (listingId: string): Promise<void> => {
  const listingRef = doc(db, 'listings', listingId);
  await updateDoc(listingRef, {
    status: 'rejected',
    updatedAt: serverTimestamp(),
  });
};

// Get all listings (admin only)
export const getAllListings = async (): Promise<Listing[]> => {
  const listingsRef = collection(db, 'listings');
  const q = query(listingsRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      availability: {
        startDate: (data.availability.startDate as Timestamp).toDate(),
        endDate: (data.availability.endDate as Timestamp).toDate(),
      },
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    } as Listing;
  });
};

// Get pending listings (admin only)
export const getPendingListings = async (): Promise<Listing[]> => {
  const listingsRef = collection(db, 'listings');
  const q = query(
    listingsRef,
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      availability: {
        startDate: (data.availability.startDate as Timestamp).toDate(),
        endDate: (data.availability.endDate as Timestamp).toDate(),
      },
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    } as Listing;
  });
};

// ========== Enhanced Search & Filter ==========

/**
 * Search listings with multiple filters
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

    // Add price filters
    if (minPrice !== undefined) {
      q = query(q, where('price', '>=', minPrice));
    }
    if (maxPrice !== undefined) {
      q = query(q, where('price', '<=', maxPrice));
    }

    const querySnapshot = await getDocs(q);
    let listings = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        availability: {
          startDate: (data.availability.startDate as Timestamp).toDate(),
          endDate: (data.availability.endDate as Timestamp).toDate(),
        },
        createdAt: (data.createdAt as Timestamp).toDate(),
        updatedAt: (data.updatedAt as Timestamp).toDate(),
      } as Listing;
    });

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
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        availability: {
          startDate: (data.availability.startDate as Timestamp).toDate(),
          endDate: (data.availability.endDate as Timestamp).toDate(),
        },
        createdAt: (data.createdAt as Timestamp).toDate(),
        updatedAt: (data.updatedAt as Timestamp).toDate(),
      } as Listing;
    });
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
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.slice(0, 10).map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        availability: {
          startDate: (data.availability.startDate as Timestamp).toDate(),
          endDate: (data.availability.endDate as Timestamp).toDate(),
        },
        createdAt: (data.createdAt as Timestamp).toDate(),
        updatedAt: (data.updatedAt as Timestamp).toDate(),
      } as Listing;
    });
  } catch (error) {
    console.error('Error getting featured listings:', error);
    return getApprovedListings();
  }
};

// ========== Booking Service ==========

/**
 * Create a new booking
 */
export const createBooking = async (
  bookingData: Omit<any, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'paymentStatus'>
): Promise<string> => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const docRef = await addDoc(bookingsRef, {
      ...bookingData,
      bookingDate: Timestamp.fromDate(bookingData.bookingDate),
      startDate: Timestamp.fromDate(bookingData.startDate),
      endDate: Timestamp.fromDate(bookingData.endDate),
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
export const getUserBookings = async (userId: string): Promise<any[]> => {
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
    }));
  } catch (error) {
    console.error('Error getting user bookings:', error);
    throw error;
  }
};

/**
 * Get partner's bookings
 */
export const getPartnerBookings = async (partnerId: string): Promise<any[]> => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('partnerId', '==', partnerId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.  docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      bookingDate: (doc.data().bookingDate as Timestamp).toDate(),
      startDate: (doc.data().startDate as Timestamp).toDate(),
      endDate: (doc.data().endDate as Timestamp).toDate(),
      createdAt: (doc.data().createdAt as Timestamp).toDate(),
      updatedAt: (doc.data().updatedAt as Timestamp).toDate(),
    }));
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

/**
 * Cancel booking
 */
export const cancelBooking = async (bookingId: string): Promise<void> => {
  try {
    await updateBookingStatus(bookingId, 'cancelled');
  } catch (error) {
    console.error('Error cancelling booking:', error);
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
    const listing = await getListing(listingId);
    
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

/**
 * Get listing by ID (alias for getListing)
 */
export const getListingById = async (listingId: string): Promise<Listing | null> => {
  return getListing(listingId);
};
