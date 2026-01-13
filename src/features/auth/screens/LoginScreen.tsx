import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { ScreenWrapper } from '../../../common/components/layout';
import { Button, Input } from '../../../common/components/ui';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../config/theme.config';
import { authStyles as styles } from '../components';
import { useAuth } from '../../../providers/AuthProvider';
import { useToast } from '../../../providers/ToastProvider';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          prompt: () => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              type?: 'standard' | 'icon';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: number;
            }
          ) => void;
        };
      };
    };
  }
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';

export const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const googleButtonRef = useRef<View>(null);

  const handleGoogleCredentialResponse = useCallback(async (response: { credential: string }) => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle({ idToken: response.credential });
      showToast('Login successful!', 'success');
      router.replace('/(tabs)');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google login failed';
      showToast(errorMessage, 'error');
    } finally {
      setGoogleLoading(false);
    }
  }, [loginWithGoogle, router, showToast]);

  // Configure Google Sign-In for Android/iOS
  useEffect(() => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
      });
    }
  }, []);

  // Native Google Sign-In for Android/iOS
  const handleNativeGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      
      // Sign out first to clear cached account and show account picker
      await GoogleSignin.signOut();
      
      const userInfo = await GoogleSignin.signIn();
      
      console.log('Google Sign-In Response:', JSON.stringify(userInfo, null, 2));
      
      // Extract idToken from the correct path
      const idToken = userInfo.data?.idToken;
      
      if (idToken) {
        await loginWithGoogle({ idToken });
        showToast('Login successful!', 'success');
        router.replace('/(tabs)');
      } else {
        console.error('No idToken in response. Full userInfo:', userInfo);
        showToast('Failed to get Google ID token. Check SHA-1 certificates in Google Console.', 'error');
      }
    } catch (error: any) {
      console.error('Google Sign-In Full Error:', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        showToast('Sign in cancelled', 'info');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        showToast('Sign in already in progress', 'info');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showToast('Play services not available', 'error');
      } else {
        showToast(`Google sign in failed: ${error.message || 'Unknown error'}`, 'error');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web' || !GOOGLE_CLIENT_ID) return;

    const loadGoogleScript = () => {
      if (document.getElementById('google-gsi-script')) {
        if (window.google?.accounts?.id) {
          setGoogleScriptLoaded(true);
        }
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setGoogleScriptLoaded(true);
      };
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || !googleScriptLoaded || !GOOGLE_CLIENT_ID) return;

    const initializeGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
        });

        const refElement = googleButtonRef.current as any;
        const buttonContainer = refElement?._nativeTag 
          ? document.querySelector(`[data-nativeid="${refElement._nativeTag}"]`)
          : (refElement as unknown as HTMLElement);
        
        if (!buttonContainer) {
          const fallbackContainer = document.querySelector('[data-google-button="true"]');
          if (fallbackContainer) {
            window.google.accounts.id.renderButton(fallbackContainer as HTMLElement, {
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              width: 300,
            });
          }
        } else {
          window.google.accounts.id.renderButton(buttonContainer as HTMLElement, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: 300,
          });
        }
      }
    };

    const timer = setTimeout(initializeGoogle, 200);
    return () => clearTimeout(timer);
  }, [googleScriptLoaded, handleGoogleCredentialResponse]);

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return newErrors;
  };

  const parseBackendError = (error: any): { field?: keyof FormErrors; message: string } => {
    // Check for 401 status code (Unauthorized)
    const statusCode = error?.response?.status || error?.status;
    if (statusCode === 401) {
      return { field: 'general', message: 'Your email or password is incorrect' };
    }

    const errorMessage = error?.message || error?.response?.data?.message || 'An error occurred';
    const errorStr = errorMessage.toLowerCase();

    // Check for status code in error message
    if (errorStr.includes('status code 401') || errorStr.includes('401')) {
      return { field: 'general', message: 'Your email or password is incorrect' };
    }

    // Email-related errors
    if (errorStr.includes('email') && errorStr.includes('not found') || 
        errorStr.includes('user not found') ||
        errorStr.includes('no account') ||
        errorStr.includes('email does not exist')) {
      return { field: 'email', message: 'No account found with this email' };
    }

    // Password-related errors
    if (errorStr.includes('password') && (errorStr.includes('incorrect') || 
        errorStr.includes('invalid') || 
        errorStr.includes('wrong'))) {
      return { field: 'password', message: 'Incorrect password' };
    }

    // General invalid credentials
    if (errorStr.includes('invalid credentials') || 
        errorStr.includes('authentication failed') ||
        errorStr.includes('login failed')) {
      return { field: 'general', message: 'Your email or password is incorrect' };
    }

    // Account status errors
    if (errorStr.includes('disabled') || errorStr.includes('suspended')) {
      return { field: 'general', message: 'Your account has been disabled. Please contact support.' };
    }

    if (errorStr.includes('not verified') || errorStr.includes('verification')) {
      return { field: 'general', message: 'Please verify your email before logging in' };
    }

    return { message: errorMessage };
  };

  const handleLogin = async () => {
    const validationErrors = validateForm();
    const errorMessages = Object.values(validationErrors).filter(Boolean);
    if (errorMessages.length > 0) {
      showToast(errorMessages[0] || 'Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    setErrors({}); // Clear previous errors
    
    try {
      await login({ email: email.trim(), password });
      setLoading(false);
      showToast('Login successful!', 'success');
      router.replace('/(tabs)');
    } catch (err) {
      setLoading(false);
      const { field, message } = parseBackendError(err);
      
      if (field && field !== 'general') {
        setErrors({ [field]: message });
      } else if (field === 'general') {
        setErrors({ general: message });
      }
      
      showToast(message, 'error');
    }
  };

  return (
    <ScreenWrapper scrollable padded backgroundColor={COLORS.white}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>JENDO</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to your account</Text>
        </View>

        <View style={styles.form}>
          {errors.general && (
            <View style={localStyles.generalErrorContainer}>
              <Ionicons name="alert-circle" size={20} color="#FF5252" />
              <Text style={localStyles.generalErrorText}>{errors.general}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={[styles.inputWrapper, errors.email && localStyles.inputError]}>
              <Ionicons name="mail-outline" size={20} color={errors.email ? '#FF5252' : COLORS.textSecondary} style={styles.inputIcon} />
              <Input
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email || errors.general) setErrors({});
                }}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
            {errors.email && <Text style={localStyles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={[styles.inputWrapper, errors.password && localStyles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color={errors.password ? '#FF5252' : COLORS.textSecondary} style={styles.inputIcon} />
              <Input
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password || errors.general) setErrors({});
                }}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                style={styles.input}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={localStyles.errorText}>{errors.password}</Text>}
          </View>

          <TouchableOpacity onPress={() => router.push('/auth/forgot-password')} style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button title="Login" onPress={handleLogin} loading={loading} style={styles.primaryButton} />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {Platform.OS === 'web' && GOOGLE_CLIENT_ID ? (
            <View style={localStyles.googleButtonContainer}>
              {googleLoading && (
                <View style={localStyles.googleLoadingOverlay}>
                  <Text style={localStyles.loadingText}>Signing in...</Text>
                </View>
              )}
              <View 
                ref={googleButtonRef} 
                style={localStyles.googleButton}
                {...({ 'data-google-button': 'true' } as any)}
              />
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.socialButton} 
              onPress={handleNativeGoogleLogin}
              disabled={googleLoading}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.socialButtonText}>
                {googleLoading ? 'Signing in...' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const localStyles = StyleSheet.create({
  inputError: {
    borderColor: '#FF5252',
    borderWidth: 1,
  },
  errorText: {
    color: '#FF5252',
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginTop: SPACING.xs,
  },
  generalErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#FF5252',
    padding: SPACING.md,
    borderRadius: SPACING.xs,
    marginBottom: SPACING.md,
  },
  generalErrorText: {
    flex: 1,
    color: '#C62828',
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: 20,
  },
  googleButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    position: 'relative' as const,
  },
  googleButton: {
    alignSelf: 'center',
  },
  googleLoadingOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
});
