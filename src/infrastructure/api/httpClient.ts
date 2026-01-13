import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../../config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/signup',
  '/auth/send-otp',
  '/auth/verify-otp',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/google',
  '/auth/refresh',
  '/doctors',
  '/notifications',
  '/chatbot',
  '/learning-materials',
  '/wellness-recommendations'
];

class HttpClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      async (config) => {
        // Only attach token if not a public endpoint
        const isPublic = PUBLIC_ENDPOINTS.some(path =>
          config.url?.includes(path)
        );
        if (!isPublic) {
          const token = await AsyncStorage.getItem('jwtToken');
          if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }
}

export const httpClient = new HttpClient();