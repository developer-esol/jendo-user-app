import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useUserStore } from '../state/userSlice';
import { storageService } from '../infrastructure/storage';
import { STORAGE_KEYS } from '../config/storage.config';
import { authApi } from '../features/auth/services/authApi';
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
      const token = await storageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      if (token) {
        try {
          const response = await withTimeout(authApi.getCurrentUser(), 5000);
          console.log('Auth /me response:', JSON.stringify(response, null, 2));
          if (response?.user) {
            console.log('Setting user from response:', JSON.stringify(response.user, null, 2));
            setUser(response.user as any);
            setProfileComplete(response.profileComplete || false);
            await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
          }
        } catch (error: any) {
          console.warn('⚠️ Auth check failed:', error?.message || error);
          try {
            const refreshResponse = await withTimeout(authApi.refreshToken(), 5000);
            if (refreshResponse?.user) {
              setUser(refreshResponse.user as any);
              setProfileComplete(refreshResponse.profileComplete || false);
              await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(refreshResponse.user));
            }
          } catch (refreshError) {
            console.warn('⚠️ Refresh failed, clearing auth state');
            await clearAuthData();
          }
        }
      } else {
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
    await storageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await storageService.removeItem(STORAGE_KEYS.USER_DATA);
    await storageService.removeItem('refreshToken');
    clearUser();
    setProfileComplete(false);
  };

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await authApi.login(credentials);
    
    await storageService.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
    await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
    
    if (response.refreshToken) {
      await storageService.setItem('refreshToken', response.refreshToken);
    }
    
    setUser(response.user as any);
    setProfileComplete(response.profileComplete || false);
    
    return response;
  }, [setUser]);

  const signup = useCallback(async (data: SignupData): Promise<AuthResponse> => {
    const response = await authApi.signup(data);
    
    await storageService.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
    await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
    
    if (response.refreshToken) {
      await storageService.setItem('refreshToken', response.refreshToken);
    }
    
    setUser(response.user as any);
    setProfileComplete(response.profileComplete || false);
    
    return response;
  }, [setUser]);

  const loginWithGoogle = useCallback(async (data: GoogleAuthData): Promise<AuthResponse> => {
    const response = await authApi.loginWithGoogle(data);
    
    await storageService.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
    await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
    
    if (response.refreshToken) {
      await storageService.setItem('refreshToken', response.refreshToken);
    }
    
    setUser(response.user as any);
    setProfileComplete(response.profileComplete || false);
    
    return response;
  }, [setUser]);

  const logout = useCallback(async () => {
    await authApi.logout();
    await clearAuthData();
  }, [clearUser]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.user) {
        setUser(response.user as any);
        setProfileComplete(response.profileComplete || false);
        await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
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
