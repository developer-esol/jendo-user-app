import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useUserStore } from '../state/userSlice';
import { storageService } from '../infrastructure/storage';
import { STORAGE_KEYS } from '../config/storage.config';
import { authService } from '../services/authService';
import { backendApi } from '../services/backendApi';
import { initPushForUser } from '../services/pushNotifications';
import { AuthResponse, UserProfile, LoginCredentials, SignupData, GoogleAuthData } from '../types/models';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  profileComplete: boolean;
  user: UserProfile | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  signup: (data: SignupData) => Promise<AuthResponse>;
  loginWithGoogle: (data: GoogleAuthData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const { user, setUser, clearUser } = useUserStore();

  const isAuthenticated = !!user;

  useEffect(() => {
    if (user?.id) {
      initPushForUser(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    const withTimeout = <T,>(promise: Promise<T>, ms = 5000) =>
      Promise.race([
        promise,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
        )
      ]);

    try {
      // Check if authenticated via Auth Service
      const isAuth = await authService.isAuthenticated();
      
      if (isAuth) {
        try {
          // Fetch user profile from Backend (requires JWT)
          const response = await withTimeout(backendApi.get('/users/me'), 5000);
          console.log('Backend /me response:', JSON.stringify(response, null, 2));
          
          // Backend returns { success, message, data: UserResponseDto, timestamp }
          const userData = response?.data || response?.user;
          
          if (userData) {
            console.log('Setting user from response:', JSON.stringify(userData, null, 2));
            setUser(userData as any);
            setProfileComplete(!!userData.firstName && !!userData.lastName);
            await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
          }
        } catch (error: any) {
          console.warn('⚠️ Auth check failed:', error?.message || error);
          
          // If 401, try to refresh token via Auth Service
          if (error?.message?.includes('Session expired') || error?.response?.status === 401) {
            try {
              const refreshResponse = await withTimeout(authService.refreshToken(), 5000);
              if (refreshResponse?.user) {
                setUser(refreshResponse.user as any);
                setProfileComplete(false); // Refresh doesn't return profileComplete
                await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(refreshResponse.user));
              }
            } catch (refreshError) {
              console.warn('⚠️ Refresh failed, clearing auth state');
              await clearAuthData();
            }
          } else {
            await clearAuthData();
          }
        }
      } else {
        // No auth token, check local storage for cached user data
        const userData = await storageService.getItem(STORAGE_KEYS.USER_DATA);
        if (userData) {
          setUser(JSON.parse(userData));
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthData = async () => {
    console.log('=== CLEARING AUTH DATA ===');
    await authService.logout(); // Clears tokens from SecureStore
    await storageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await storageService.removeItem(STORAGE_KEYS.USER_DATA);
    await storageService.removeItem('refreshToken');
    await storageService.removeItem('hasSeenOnboarding'); // Clear onboarding state too
    clearUser();
    setProfileComplete(false);
    console.log('✅ All auth data cleared');
  };

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    console.log('=== AUTH PROVIDER LOGIN ===');
    
    // Login via Auth Service
    const authData = await authService.login(credentials.email, credentials.password);
    console.log('Auth Service login successful, userId:', authData.user.id);
    
    // Map Auth Service response to app's AuthResponse format
    const response: AuthResponse = {
      token: authData.accessToken,
      refreshToken: authData.refreshToken,
      userId: authData.user.id,
      email: authData.user.email,
      fullName: authData.user.fullName,
      user: authData.user as any,
      profileComplete: false, // Auth Service doesn't track this
    };
    
    // Store legacy tokens for backward compatibility
    await storageService.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
    await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
    
    if (response.refreshToken) {
      await storageService.setItem('refreshToken', response.refreshToken);
    }
    
    // CRITICAL: Fetch ACTUAL profile from Jendo Backend (single source of truth)
    console.log('=== FETCHING JENDO PROFILE AFTER LOGIN ===');
    try {
      const jendoProfileResponse = await backendApi.get('/users/me');
      console.log('Jendo profile fetched:', JSON.stringify(jendoProfileResponse, null, 2));
      
      // Backend returns { success, message, data: UserResponseDto, timestamp }
      // The actual user object is in the 'data' field
      const jendoUser = jendoProfileResponse?.data || jendoProfileResponse?.user;
      
      if (jendoUser) {
        console.log('✅ Using Jendo profile for user state:', jendoUser);
        
        setUser(jendoUser as any);
        setProfileComplete(!!jendoUser.firstName && !!jendoUser.lastName);
        await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(jendoUser));
      } else {
        // Fallback to Auth user if Jendo profile fetch fails
        console.warn('⚠️ Jendo profile not found, using Auth user');
        setUser(response.user as any);
        setProfileComplete(response.profileComplete || false);
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch Jendo profile:', error.message);
      // Don't throw - allow login to succeed with Auth user data
      setUser(response.user as any);
      setProfileComplete(response.profileComplete || false);
    }
    
    console.log('=== AUTH PROVIDER LOGIN COMPLETE ===');
    return response;
  }, [setUser]);

  const signup = useCallback(async (data: SignupData): Promise<AuthResponse> => {
    console.log('=== AUTH PROVIDER SIGNUP ===');
    console.log('Signup data received:', { ...data, password: '***hidden***' });
    
    // Register via Auth Service
    console.log('Calling authService.register...');
    const authData = await authService.register({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
    });
    
    console.log('authService.register SUCCESS');
    console.log('Auth data user:', authData.user);
    
    // Map Auth Service response to app's AuthResponse format
    const response: AuthResponse = {
      token: authData.accessToken,
      refreshToken: authData.refreshToken,
      userId: authData.user.id,
      email: authData.user.email,
      user: authData.user as any,
      profileComplete: false, // Auth Service doesn't track this
    };
    
    // Store legacy tokens for backward compatibility
    console.log('Storing legacy tokens...');
    await storageService.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
    await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
    
    if (response.refreshToken) {
      await storageService.setItem('refreshToken', response.refreshToken);
    }
    
    console.log('Setting user state...');
    setUser(response.user as any);
    setProfileComplete(response.profileComplete || false);
    
    // CRITICAL: Create Jendo profile with actual user data
    console.log('=== CREATING JENDO PROFILE WITH USER DATA ===');
    try {
      const profilePayload = {
        authUserId: authData.user.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName || '',
        phone: data.phone || null,
      };
      
      console.log('Calling POST /api/jendo-users with payload:', profilePayload);
      const jendoProfileResponse = await backendApi.post('/jendo-users', profilePayload);
      console.log('Jendo profile response:', JSON.stringify(jendoProfileResponse, null, 2));
      
      if (jendoProfileResponse?.user) {
        console.log('✅ Jendo profile created successfully:', jendoProfileResponse.user);
        // Update user state with Jendo profile data
        setUser(jendoProfileResponse.user as any);
        setProfileComplete(jendoProfileResponse.profileComplete || false);
        await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(jendoProfileResponse.user));
      }
    } catch (error: any) {
      console.error('❌ Failed to create Jendo profile:', error.message);
      console.error('Error details:', error.response?.data || error);
      // Don't throw - user is registered in Auth Service, profile can be created on next login
    }
    
    console.log('=== AUTH PROVIDER SIGNUP COMPLETE ===');
    return response;
  }, [setUser]);

  const loginWithGoogle = useCallback(async (data: GoogleAuthData): Promise<AuthResponse> => {
    // TODO: Implement Google OAuth with Auth Service
    // For now, throw error indicating this needs to be implemented
    throw new Error('Google OAuth integration with Auth Service is not yet implemented');
  }, [setUser]);

  const logout = useCallback(async () => {
    await clearAuthData();
  }, [clearUser]);

  const refreshUser = useCallback(async () => {
    try {
      // Fetch user profile from Backend
      const response = await backendApi.get('/users/me');
      // Backend returns { success, message, data: UserResponseDto, timestamp }
      const userData = response?.data || response?.user;
      
      if (userData) {
        setUser(userData as any);
        setProfileComplete(!!userData.firstName && !!userData.lastName);
        await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, [setUser]);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      profileComplete,
      user: user as UserProfile | null,
      login, 
      signup,
      loginWithGoogle,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
