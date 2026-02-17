/**
 * Authentication Service - Backend JWT Integration (Mobile)
 * Connects to SkyConnect backend API for authentication
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/api`;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role: 'traveler' | 'partner' | 'admin';
}

export interface User {
  user_id: string;
  email: string;
  full_name: string;
  role: 'traveler' | 'partner' | 'admin';
  is_active: boolean;
  created_at: string;
  email_verified: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface TokenData {
  access_token: string;
  token_type: string;
  expires_at: number; // Timestamp when token expires
}

class AuthService {
  private readonly TOKEN_KEY = '@skyconnect_auth_token';
  private readonly USER_KEY = '@skyconnect_user';

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        email: data.email.trim(),
        password: data.password.trim(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    const result: AuthResponse = await response.json();
    
    // Store token and user data
    await this.storeAuth(result);
    
    return result;
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // OAuth2 password flow uses form data
    const formData = new URLSearchParams();
    formData.append('username', credentials.email.trim());
    formData.append('password', credentials.password.trim());

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const result: AuthResponse = await response.json();
    
    // Store token and user data
    await this.storeAuth(result);
    
    return result;
  }

  /**
   * Logout - clear async storage
   */
  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([this.TOKEN_KEY, this.USER_KEY]);
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User | null> {
    const token = await this.getToken();
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Token might be invalid or expired
        await this.logout();
        return null;
      }

      const user: User = await response.json();
      await this.storeUser(user);
      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Verify token validity
   */
  async verifyToken(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/auth/verify-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        await this.logout();
        return false;
      }

      const result = await response.json();
      return result.valid === true;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }

  /**
   * Get stored token
   */
  async getToken(): Promise<string | null> {
    const tokenData = await AsyncStorage.getItem(this.TOKEN_KEY);
    if (!tokenData) {
      return null;
    }

    try {
      const parsed: TokenData = JSON.parse(tokenData);
      
      // Check if token is expired
      if (Date.now() > parsed.expires_at) {
        await this.logout();
        return null;
      }

      return parsed.access_token;
    } catch (error) {
      console.error('Failed to parse token:', error);
      return null;
    }
  }

  /**
   * Get stored user data
   */
  async getUser(): Promise<User | null> {
    const userData = await AsyncStorage.getItem(this.USER_KEY);
    if (!userData) {
      return null;
    }

    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  /**
   * Store authentication data
   */
  private async storeAuth(authResponse: AuthResponse): Promise<void> {
    // Calculate token expiration (expires_in is in seconds)
    const expiresAt = Date.now() + (authResponse.expires_in * 1000);

    const tokenData: TokenData = {
      access_token: authResponse.access_token,
      token_type: authResponse.token_type,
      expires_at: expiresAt,
    };

    await AsyncStorage.multiSet([
      [this.TOKEN_KEY, JSON.stringify(tokenData)],
      [this.USER_KEY, JSON.stringify(authResponse.user)],
    ]);
  }

  /**
   * Store user data
   */
  private async storeUser(user: User): Promise<void> {
    await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Create authenticated fetch request helper
   */
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    return fetch(url, { ...options, headers });
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
