/**
 * API Configuration
 * Backend API base URL for network requests
 */

// Backend server configuration
// Update this IP address if your computer IP changes
export const API_BASE_URL = 'http://10.72.72.199:8000';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_ME: '/api/auth/me',
  AUTH_VERIFY_TOKEN: '/api/auth/verify-token',
  
  // Listings
  LISTINGS: '/api/listings',
  LISTING_DETAIL: (id: string) => `/api/listings/${id}`,
  
  // Partners
  PARTNERS: '/api/partners',
  PARTNER_LISTINGS: (partnerId: string) => `/api/partners/${partnerId}/listings`,
  
  // AI Features
  AI_CHAT: '/api/chat',
  AI_SEARCH: '/api/search/semantic',
  AI_RECOMMEND: '/api/recommend',
  
  // Admin
  ADMIN_TRAIN: '/api/admin/train',
};

// Request timeout (30 seconds)
export const REQUEST_TIMEOUT = 30000;

// Development mode flag
export const IS_DEV = __DEV__;
