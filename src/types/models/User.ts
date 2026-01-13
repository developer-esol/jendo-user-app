export interface User {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  address?: string;
  nationality?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthParameters {
  height?: number;
  weight?: number;
  bmi?: number;
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
}

export interface UserProfile extends User {
  healthParameters?: HealthParameters;
  riskLevel?: 'low' | 'moderate' | 'high';
  lastTestDate?: string;
  roles?: string[];
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  userId: number;
  email: string;
  fullName: string;
  user: UserProfile;
  profileComplete: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profileComplete: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface GoogleAuthData {
  idToken: string;
  accessToken?: string;
}

export interface OTPVerification {
  email: string;
  otp: string;
}
