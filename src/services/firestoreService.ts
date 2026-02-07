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
export const approvePartner = async (userId: string): Promise<void> => {
  const partnerRef = doc(db, 'partners', userId);
  await updateDoc(partnerRef, {
    status: 'approved',
    updatedAt: serverTimestamp(),
  });
};

// Admin function to reject partner
export const rejectPartner = async (userId: string): Promise<void> => {
  const partnerRef = doc(db, 'partners', userId);
  await updateDoc(partnerRef, {
    status: 'rejected',
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
