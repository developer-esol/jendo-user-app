/**
 * Backend API Client
 * 
 * This client handles ALL business logic API calls to Jendo Backend (port 8081).
 * JWT tokens from Auth Service MUST be attached to every request.
 * 
 * CRITICAL RULES:
 * ✅ ALWAYS attach JWT token via Authorization header
 * ✅ Handle 401 (redirect to login)
 * ✅ Handle 403 (show access denied)
 * ❌ DO NOT store user credentials
 */

import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authService } from './authService';

// Backend runs on port 8081
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.130.49:8081/api';

interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

class BackendApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: BACKEND_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request/response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor: Attach JWT token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Don't attach token to public endpoints (if any)
        const publicEndpoints = ['/public'];
        const isPublicEndpoint = publicEndpoints.some(endpoint => 
          config.url?.startsWith(endpoint)
        );

        if (!isPublicEndpoint) {
          const token = await authService.getStoredToken();
          
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor: Handle 401/403 errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - Token expired or invalid
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue the request while refreshing
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client(originalRequest);
              })
              .catch(err => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Attempt to refresh token
            const authData = await authService.refreshToken();
            
            // Process queued requests
            this.processQueue(authData.accessToken, null);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${authData.accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed - logout user
            this.processQueue(null, refreshError);
            await authService.logout();
            
            // Navigate to login (handled by AuthProvider)
            throw new Error('Session expired. Please login again.');
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle 403 Forbidden - Insufficient permissions
        if (error.response?.status === 403) {
          throw new Error('Access denied. You do not have permission to perform this action.');
        }

        // Handle other errors
        const message = error.response?.data?.message || 'An error occurred';
        throw new Error(message);
      }
    );
  }

  /**
   * Process queued requests after token refresh
   * 
   * @param token New access token
   * @param error Error if refresh failed
   */
  private processQueue(token: string | null, error: any): void {
    this.failedQueue.forEach(promise => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  /**
   * Get Axios instance for making requests
   * 
   * @returns Axios instance
   */
  getInstance(): AxiosInstance {
    return this.client;
  }

  /**
   * Generic GET request
   * 
   * @param url Endpoint URL
   * @param config Request config
   * @returns Response data
   */
  async get<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * Generic POST request
   * 
   * @param url Endpoint URL
   * @param data Request body
   * @param config Request config
   * @returns Response data
   */
  async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PUT request
   * 
   * @param url Endpoint URL
   * @param data Request body
   * @param config Request config
   * @returns Response data
   */
  async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic DELETE request
   * 
   * @param url Endpoint URL
   * @param config Request config
   * @returns Response data
   */
  async delete<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

// Export singleton instance
export const backendApi = new BackendApiClient();

// Export types
export type { ApiErrorResponse };
