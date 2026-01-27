/**
 * Auth Service API - Connects to External Auth Microservice
 * 
 * This service handles ALL authentication operations via the Auth Microservice (port 8080).
 * The backend (port 8090) ONLY receives JWT tokens for validation.
 * 
 * CRITICAL RULES:
 * ❌ DO NOT store tokens in localStorage (web) or AsyncStorage insecurely
 * ❌ DO NOT validate roles on frontend
 * ❌ DO NOT decode JWT tokens
 * ✅ USE SecureStore for token storage (React Native)
 * ✅ ATTACH JWT to all backend API calls
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { secureStorage } from '../utils/secureStorage';

// Auth Service runs on port 8080
const AUTH_SERVICE_URL = process.env.EXPO_PUBLIC_AUTH_URL || 'http://192.168.130.49:8080/api/auth';

console.log('=== AUTH SERVICE INITIALIZED ===');
console.log('process.env.EXPO_PUBLIC_AUTH_URL:', process.env.EXPO_PUBLIC_AUTH_URL);
console.log('AUTH_SERVICE_URL:', AUTH_SERVICE_URL);

// Token storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

interface GoogleLoginRequest {
  idToken: string;
  clientId: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: {
      name: string; // Should be "JENDO_USER"
      permissions: string[];
    };
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class AuthService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: AUTH_SERVICE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Login user via Auth Microservice
   * 
   * @param email User email
   * @param password User password
   * @returns Auth response with JWT token
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.client.post<ApiResponse<AuthResponse>>('/login', {
        email,
        password,
      });

      const authData = response.data.data;

      // Store tokens securely
      await this.storeToken(authData.accessToken);
      await this.storeRefreshToken(authData.refreshToken);

      return authData;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Register new user via Auth Microservice
   * 
   * @param payload Registration data
   * @returns Auth response with JWT token
   */
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    console.log('=== AUTH SERVICE REGISTER ===');
    console.log('AUTH_SERVICE_URL:', AUTH_SERVICE_URL);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    try {
      console.log('Making POST request to:', `${AUTH_SERVICE_URL}/register`);
      const response = await this.client.post<ApiResponse<AuthResponse>>('/register', payload);

      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      
      const authData = response.data.data;

      // Store tokens securely
      console.log('Storing tokens...');
      await this.storeToken(authData.accessToken);
      await this.storeRefreshToken(authData.refreshToken);
      console.log('Tokens stored successfully');

      return authData;
    } catch (error: any) {
      console.log('=== AUTH SERVICE ERROR ===');
      console.log('Error type:', typeof error);
      console.log('Error message:', error.message);
      console.log('Error code:', error.code);
      console.log('Error response:', error.response?.data);
      console.log('Error request:', error.request ? 'Request was made but no response' : 'Request setup failed');
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   * Clears stored tokens
   */
  async logout(): Promise<void> {
    try {
      // Clear tokens from secure storage
      await secureStorage.deleteItem(TOKEN_KEY);
      await secureStorage.deleteItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Login or register user via Google OAuth (Mobile)
   * 
   * @param idToken Google ID token from mobile sign-in
   * @param clientId The Google client ID used for sign-in
   * @returns Auth response with JWT token
   */
  async loginWithGoogle(idToken: string, clientId: string): Promise<AuthResponse> {
    console.log('=== AUTH SERVICE GOOGLE LOGIN ===');
    console.log('AUTH_SERVICE_URL:', AUTH_SERVICE_URL);
    
    try {
      console.log('Making POST request to:', `${AUTH_SERVICE_URL}/mobile/google`);
      const response = await this.client.post<ApiResponse<AuthResponse>>('/mobile/google', {
        idToken,
        clientId,
      });

      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      
      const authData = response.data.data;

      // Store tokens securely
      console.log('Storing tokens...');
      await this.storeToken(authData.accessToken);
      await this.storeRefreshToken(authData.refreshToken);
      console.log('Tokens stored successfully');

      return authData;
    } catch (error: any) {
      console.log('=== AUTH SERVICE GOOGLE LOGIN ERROR ===');
      console.log('Error type:', typeof error);
      console.log('Error message:', error.message);
      console.log('Error code:', error.code);
      console.log('Error response:', error.response?.data);
      throw this.handleError(error);
    }
  }

  /**
   * Send verification OTP to email
   */
  async sendOtp(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.post('/send-otp', { email });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify OTP for email
   */
  async verifyOtp(email: string, otp: string): Promise<{ success: boolean; verified: boolean }> {
    try {
      const response = await this.client.post('/verify-otp', { email, otp });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Confirm registration after OTP verified (create user without issuing tokens)
   */
  async confirmSignup(payload: { email: string; password: string; firstName: string; lastName?: string; phone?: string }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.post('/register/confirm', payload);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get stored access token
   * 
   * @returns JWT token or null
   */
  async getStoredToken(): Promise<string | null> {
    try {
      return await secureStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  /**
   * Get stored refresh token
   * 
   * @returns Refresh token or null
   */
  async getStoredRefreshToken(): Promise<string | null> {
    try {
      return await secureStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   * 
   * @returns true if token exists
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return !!token;
  }

  /**
   * Refresh access token
   * 
   * @returns New auth response
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = await this.getStoredRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.client.post<ApiResponse<AuthResponse>>('/refresh', {
        refreshToken,
      });

      const authData = response.data.data;

      // Store new tokens
      await this.storeToken(authData.accessToken);
      await this.storeRefreshToken(authData.refreshToken);

      return authData;
    } catch (error: any) {
      // If refresh fails, logout user
      await this.logout();
      throw this.handleError(error);
    }
  }

  /**
   * Store access token securely
   * 
   * @param token JWT access token
   */
  private async storeToken(token: string): Promise<void> {
    await secureStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Store refresh token securely
   * 
   * @param token JWT refresh token
   */
  private async storeRefreshToken(token: string): Promise<void> {
    await secureStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  /**
   * Handle API errors
   * 
   * @param error Axios error
   * @returns Error object
   */
  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.message || 'Authentication failed';
      return new Error(message);
    } else if (error.request) {
      return new Error('Network error - Auth Service unreachable');
    } else {
      return new Error(error.message || 'Unknown error occurred');
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export types
export type { LoginRequest, RegisterRequest, AuthResponse };
