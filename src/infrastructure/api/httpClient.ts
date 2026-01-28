/**
 * Legacy HTTP Client - DEPRECATED
 * 
 * ⚠️ MIGRATION NOTICE:
 * This client is being replaced by the new dual-service architecture:
 * - authService.ts → Auth Microservice (port 8080)
 * - backendApi.ts → Jendo Backend (port 8090)
 * 
 * Please use the appropriate service for your needs:
 * - For authentication: import { authService } from '@/services/authService'
 * - For business logic: import { backendApi } from '@/services/backendApi'
 * 
 * This file is kept for backward compatibility only.
 */

import { backendApi } from '../../services/backendApi';
import { AxiosRequestConfig } from 'axios';

class HttpClient {
  /**
   * @deprecated Use backendApi.get() instead
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    console.warn('⚠️ httpClient is deprecated. Use backendApi instead.');
    return backendApi.get<T>(url, config);
  }

  /**
   * @deprecated Use backendApi.post() instead
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    console.warn('⚠️ httpClient is deprecated. Use backendApi instead.');
    return backendApi.post<T>(url, data, config);
  }

  /**
   * @deprecated Use backendApi.put() instead
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    console.warn('⚠️ httpClient is deprecated. Use backendApi instead.');
    return backendApi.put<T>(url, data, config);
  }

  /**
   * @deprecated Use backendApi.patch() instead
   */
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    console.warn('⚠️ httpClient is deprecated. Use backendApi instead.');
    return backendApi.patch<T>(url, data, config);
  }

  /**
   * @deprecated Use backendApi.delete() instead
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    console.warn('⚠️ httpClient is deprecated. Use backendApi instead.');
    return backendApi.delete<T>(url, config);
  }
}

export const httpClient = new HttpClient();