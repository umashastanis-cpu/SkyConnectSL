// User role types
export type UserRole = 'traveler' | 'partner' | 'admin';

// User status
export type PartnerStatus = 'pending' | 'approved' | 'rejected';

// Base User interface
export interface User {
  uid: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Traveler Profile
export interface TravelerProfile {
  userId: string;
  name: string;
  email: string;
  travelPreferences: string[]; // e.g., ["Beach", "Adventure", "Cultural"]
  budgetRange: {
    min: number;
    max: number;
  };
  travelType: string; // e.g., "Solo", "Family", "Group"
  createdAt: Date;
  updatedAt: Date;
}

// Partner Profile
export interface PartnerProfile {
  userId: string;
  companyName: string;
  description: string;
  location: string;
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  status: PartnerStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Listing types
export type ListingCategory = 'tour' | 'accommodation' | 'transport' | 'activity';
export type ListingStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Listing {
  id?: string;
  partnerId: string;
  partnerName: string;
  title: string;
  description: string;
  category: ListingCategory;
  location: string;
  price: number;
  currency: string;
  images: string[];
  amenities?: string[];
  maxCapacity?: number;
  duration?: string; // e.g., "3 hours", "2 days"
  availability: {
    startDate: Date;
    endDate: Date;
  };
  status: ListingStatus;
  tags: string[];
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

// Navigation types
export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  EmailVerification: undefined;
  CreateTravelerProfile: undefined;
  CreatePartnerProfile: undefined;
  EditTravelerProfile: undefined;
  EditPartnerProfile: undefined;
  TravelerHome: undefined;
  PartnerHome: undefined;
  AdminDashboard: undefined;
  CreateListing: undefined;
  BrowseListings: { category?: ListingCategory };
  ListingDetail: { listingId: string };
  PartnerListings: undefined;
};
