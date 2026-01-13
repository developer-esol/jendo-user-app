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
import { API_ENDPOINTS, httpClient } from '../../../infrastructure/api';
import { ENDPOINTS } from '../../../config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await httpClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    if (res.data?.token) {
      await AsyncStorage.setItem('jwtToken', res.data.token);
      if (res.data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', res.data.refreshToken);
      }
    }
    return res.data;
  },

  signup: async (data: SignupData): Promise<AuthResponse> => {
    const res = await httpClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.REGISTER, data);
    if (res.data?.token) {
      await AsyncStorage.setItem('jwtToken', res.data.token);
      if (res.data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', res.data.refreshToken);
      }
    }
    return res.data;
  },

  sendOtp: async (data: { email: string }): Promise<{ success: boolean; message: string }> => {
    const res = await httpClient.post<ApiResponse<{ success: boolean; message: string }>>(
      API_ENDPOINTS.AUTH.SEND_OTP, 
      data
    );
    return res.data;
  },

  verifyOtp: async (data: OTPVerification): Promise<{ success: boolean; verified: boolean }> => {
    const res = await httpClient.post<ApiResponse<{ success: boolean; verified: boolean }>>(
      API_ENDPOINTS.AUTH.VERIFY_OTP, 
      data
    );
    return res.data;
  },

  requestPasswordReset: async (data: PasswordResetRequest): Promise<{ success: boolean; message: string }> => {
    const res = await httpClient.post<ApiResponse<{ success: boolean; message: string }>>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD, 
      data
    );
    return res.data;
  },

  resetPassword: async (data: ResetPasswordData): Promise<{ success: boolean; message: string }> => {
    const res = await httpClient.post<ApiResponse<{ success: boolean }>>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD, 
      data
    );
    return { success: res.data.success, message: res.message };
  },

  changePassword: async (data: ChangePasswordData): Promise<{ success: boolean; message: string }> => {
    const res = await httpClient.post<ApiResponse<{ success: boolean }>>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD, 
      data
    );
    return { success: res.data.success, message: res.message };
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const res = await httpClient.get<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.ME);
    return res.data;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await httpClient.put<ApiResponse<UserProfile>>(ENDPOINTS.USER.UPDATE_PROFILE, data);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('jwtToken');
    await AsyncStorage.removeItem('refreshToken');
    try {
      await httpClient.post<ApiResponse<{ success: boolean }>>(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (e) {
      // Ignore errors on logout
    }
  },

  loginWithGoogle: async (data: GoogleAuthData): Promise<AuthResponse> => {
    const res = await httpClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.GOOGLE, data);
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
    
    const res = await httpClient.post<ApiResponse<AuthResponse>>(
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
