import { 
  UserProfile, 
  LoginCredentials, 
  SignupData, 
  OTPVerification, 
  PasswordResetRequest,
  AuthResponse,
  ResetPasswordData,
  ChangePasswordData,
  GoogleAuthData
} from '../../../types/models';
import { API_ENDPOINTS } from '../../../infrastructure/api';
import { ENDPOINTS } from '../../../config/api.config';
import { backendApi } from '../../../services/backendApi';
import { authService } from '../../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await backendApi.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    if (res.data?.token) {
      await AsyncStorage.setItem('jwtToken', res.data.token);
      if (res.data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', res.data.refreshToken);
      }
    }
    return res.data;
  },

  signup: async (data: SignupData): Promise<AuthResponse> => {
    const res = await backendApi.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.REGISTER, data);
    if (res.data?.token) {
      await AsyncStorage.setItem('jwtToken', res.data.token);
      if (res.data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', res.data.refreshToken);
      }
    }
    return res.data;
  },

  sendOtp: async (data: { email: string }): Promise<{ success: boolean; message: string }> => {
    // Use auth service directly (Auth Microservice)
    return await authService.sendOtp(data.email);
  },

  verifyOtp: async (data: OTPVerification): Promise<{ success: boolean; verified: boolean }> => {
    return await authService.verifyOtp(data.email, data.otp);
  },

  confirmSignup: async (data: SignupData): Promise<{ success: boolean; message: string }> => {
    return await authService.confirmSignup(data as any);
  },

  requestPasswordReset: async (data: PasswordResetRequest): Promise<{ success: boolean; message: string }> => {
    const res = await backendApi.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);

    // Some responses may return ApiResponse without .data; be resilient
    const success = (res as any)?.data ? (res as any).data?.success : true;
    const message = (res as any)?.message ?? 'If an account exists, a reset code has been sent.';

    return { success, message };
  },

  resetPassword: async (data: ResetPasswordData): Promise<{ success: boolean; message: string }> => {
    const res = await backendApi.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);

    // Guard against null data payloads from proxy/auth service
    const success = (res as any)?.data ? (res as any).data?.success : true;
    const message = (res as any)?.message ?? 'Password reset successful';

    return { success, message };
  },

  changePassword: async (data: ChangePasswordData): Promise<{ success: boolean; message: string }> => {
    const res = await backendApi.post<ApiResponse<{ success: boolean }>>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      data
    );

    // Handle null/variant responses gracefully to avoid runtime errors
    if (!res) {
      return { success: true, message: 'Password changed successfully' };
    }

    // Some proxies/clients may return ApiResponse directly or with .data wrapper
    const payload = (res as any).data ?? res;
    const success = payload?.success ?? true;
    const message = (res as any).message ?? 'Password changed successfully';

    return { success, message };
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const res = await backendApi.get<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.ME);
    return res.data;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await backendApi.put<ApiResponse<UserProfile>>(ENDPOINTS.USER.UPDATE_PROFILE, data);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('jwtToken');
    await AsyncStorage.removeItem('refreshToken');
    try {
      await backendApi.post<ApiResponse<{ success: boolean }>>(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (e) {
      // Ignore errors on logout
    }
  },

  loginWithGoogle: async (data: GoogleAuthData): Promise<AuthResponse> => {
    const res = await backendApi.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.GOOGLE, data);
    if (res.data?.token) {
      await AsyncStorage.setItem('jwtToken', res.data.token);
      if (res.data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', res.data.refreshToken);
      }
    }
    return res.data;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      throw new Error('No refresh token available');
    }
    
    const res = await backendApi.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN, 
      { refreshToken: storedRefreshToken }
    );
    
    if (res.data?.token) {
      await AsyncStorage.setItem('jwtToken', res.data.token);
      if (res.data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', res.data.refreshToken);
      }
    }
    return res.data;
  },
  
  getStoredToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem('jwtToken');
  },
  
  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('jwtToken');
    return !!token;
  },
};
