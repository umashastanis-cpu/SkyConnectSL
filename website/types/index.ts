export type UserRole = 'traveler' | 'partner' | 'admin';
export type PartnerStatus = 'pending' | 'approved' | 'rejected';
export type ListingCategory = 'tour' | 'accommodation' | 'transport' | 'activity';
export type ListingStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TravelerProfile {
  userId: string;
  name: string;
  email: string;
  country: string;
  interests: string[];
  budgetMin: number;
  budgetMax: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartnerProfile {
  userId: string;
  email: string;
  businessName: string;
  businessCategory: string;
  businessAddress: string;
  contactPhone: string;
  registrationNumber?: string;
  description: string;
  approvalStatus: PartnerStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Listing {
  id?: string;
  partnerId: string;
  title: string;
  description: string;
  category: ListingCategory;
  location?: string;
  price: number;
  duration?: string;
  capacity?: number;
  isActive: boolean;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}
