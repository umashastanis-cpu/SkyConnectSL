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
import { TravelerProfile, PartnerProfile, Listing, ListingCategory } from '../types';

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
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
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
  await setDoc(partnerRef, {
    ...profile,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
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
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
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

// ========== Listings Service ==========

export const createListing = async (
  listing: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const listingsRef = collection(db, 'listings');
  const docRef = await addDoc(listingsRef, {
    ...listing,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateListing = async (
  listingId: string,
  updates: Partial<Omit<Listing, 'id' | 'partnerId' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const listingRef = doc(db, 'listings', listingId);
  await updateDoc(listingRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteListing = async (listingId: string): Promise<void> => {
  const listingRef = doc(db, 'listings', listingId);
  await deleteDoc(listingRef);
};

export const getListing = async (listingId: string): Promise<Listing | null> => {
  const listingRef = doc(db, 'listings', listingId);
  const listingSnap = await getDoc(listingRef);

  if (listingSnap.exists()) {
    const data = listingSnap.data();
    return {
      id: listingSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Listing;
  }

  return null;
};

export const getAllListings = async (category?: ListingCategory): Promise<Listing[]> => {
  const listingsRef = collection(db, 'listings');
  let q;
  
  if (category) {
    q = query(
      listingsRef,
      where('isActive', '==', true),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(
      listingsRef,
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Listing;
  });
};

export const getPartnerListings = async (partnerId: string): Promise<Listing[]> => {
  const listingsRef = collection(db, 'listings');
  const q = query(
    listingsRef,
    where('partnerId', '==', partnerId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Listing;
  });
};

export const getPendingPartners = async (): Promise<PartnerProfile[]> => {
  const partnersRef = collection(db, 'partners');
  const q = query(partnersRef, where('approvalStatus', '==', 'pending'));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as PartnerProfile;
  });
};

export const approvePartner = async (userId: string): Promise<void> => {
  const partnerRef = doc(db, 'partners', userId);
  await updateDoc(partnerRef, {
    approvalStatus: 'approved',
    updatedAt: serverTimestamp(),
  });
};

export const rejectPartner = async (userId: string): Promise<void> => {
  const partnerRef = doc(db, 'partners', userId);
  await updateDoc(partnerRef, {
    approvalStatus: 'rejected',
    updatedAt: serverTimestamp(),
  });
};
