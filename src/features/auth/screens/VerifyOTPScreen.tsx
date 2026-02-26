import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { Button } from '../../../common/components/ui';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../config/theme.config';
import { authStyles as styles } from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/authApi';
import { useToast } from '../../../providers/ToastProvider';

export const VerifyOTPScreen: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  const [error, setError] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Clear error when user starts typing
    if (error) setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const parseBackendError = (error: any): string => {
    const statusCode = error?.response?.status || error?.status;
    const errorMessage = error?.message || error?.response?.data?.message || error?.response?.data?.error || 'An error occurred';
    const errorStr = errorMessage.toLowerCase();

    // Check for duplicate email / already registered (check FIRST before status code checks)
    if (errorStr.includes('already registered') || errorStr.includes('already exists') ||
        errorStr.includes('duplicate') ||
        (errorStr.includes('email') && (errorStr.includes('already') || errorStr.includes('exists') || 
         errorStr.includes('registered') || errorStr.includes('taken') || errorStr.includes('in use')))) {
      return 'An account with this email already exists. Please use a different email or login instead.';
    }

    // Check for 400 status code (most common error)
    if (statusCode === 400 || errorStr.includes('status code 400')) {
      // Check if it's about duplicate email
      if (errorStr.includes('email') || errorStr.includes('already') || 
          errorStr.includes('exists') || errorStr.includes('duplicate')) {
        return 'An account with this email already exists. Please use a different email or login instead.';
      }
      // Generic 400 error - likely invalid OTP or data
      return 'Invalid verification code. The 6-digit code you entered is incorrect. Please check your email and try again.';
    }

    // Check for 409 status code (conflict - duplicate resource)
    if (statusCode === 409 || errorStr.includes('status code 409')) {
      return 'An account with this email already exists. Please use a different email or login instead.';
    }

    // Invalid OTP
    if (errorStr.includes('invalid') && (errorStr.includes('otp') || errorStr.includes('code') || errorStr.includes('verification'))) {
      return 'Invalid verification code. The code you entered is incorrect. Please check your email and try again.';
    }

    // Incorrect/wrong OTP
    if ((errorStr.includes('incorrect') || errorStr.includes('wrong')) && (errorStr.includes('otp') || errorStr.includes('code'))) {
      return 'Incorrect verification code. Please enter the 6-digit code from your email.';
    }

    // Expired OTP
    if (errorStr.includes('expired') || errorStr.includes('expire')) {
      return 'Verification code has expired. Please tap "Resend Code" to receive a new one.';
    }

    // OTP not found
    if (errorStr.includes('not found') && (errorStr.includes('otp') || errorStr.includes('code') || errorStr.includes('verification'))) {
      return 'Verification code not found. Please request a new code by tapping "Resend Code".';
    }

    // Too many attempts
    if (errorStr.includes('too many') && (errorStr.includes('attempt') || errorStr.includes('invalid'))) {
      return 'Too many invalid attempts. Please request a new code by tapping "Resend Code".';
    }

    // Email not verified
    if (errorStr.includes('not verified') || errorStr.includes('email not verified')) {
      return 'Email verification required. Please request a new code and verify first.';
    }

    // Fallback to a generic user-friendly message
    return 'Verification failed. Please check the 6-digit code from your email and try again.';
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    
    try {
      const otpCode = otp.join('');

      // Try to get signup data (signup flow) or resend email (login verification flow)
      const signupDataStr = await AsyncStorage.getItem('signupData');
      const resendEmail = await AsyncStorage.getItem('resendVerificationEmail');
      let email: string | null = null;
      let signupData: any = null;

      if (signupDataStr) {
        signupData = JSON.parse(signupDataStr);
        email = signupData.email;
      } else if (resendEmail) {
        email = resendEmail;
      }

      if (!email) {
        throw new Error('No verification flow found. Please start the process again.');
      }

      // 1. Verify OTP
      const verifyResult = await authApi.verifyOtp({ email, otp: otpCode });
      
      // Defensive check: ensure OTP was actually verified successfully
      if (!verifyResult || !verifyResult.verified || !verifyResult.success) {
        throw new Error('Invalid verification code');
      }

      if (signupData) {
        // Signup flow: confirm signup on Auth Service (creates user but does NOT log in)
        await authApi.confirmSignup(signupData);

        // Clear signup data
        await AsyncStorage.removeItem('signupData');

        setLoading(false);
        showToast('Account created successfully! Please login.', 'success');
        router.replace('/auth/login');
      } else {
        // Login verification flow: remove resend key and prompt login
        await AsyncStorage.removeItem('resendVerificationEmail');
        setLoading(false);
        showToast('Email verified successfully! Please login.', 'success');
        router.replace('/auth/login');
      }
    } catch (err) {
      setLoading(false);
      const errorMessage = parseBackendError(err);
      setError(errorMessage);
      showToast(errorMessage, 'error');
      
      // If email already exists, redirect back to signup after showing error
      if (errorMessage.includes('already exists')) {
        setTimeout(async () => {
          await AsyncStorage.removeItem('signupData');
          Alert.alert(
            'Email Already Registered',
            'This email is already registered. Please use a different email or login to your existing account.',
            [
              {
                text: 'Go to Login',
                onPress: () => router.replace('/auth/login')
              },
              {
                text: 'Try Different Email',
                onPress: () => router.replace('/auth/signup')
              }
            ]
          );
        }, 1500);
      }
    }
  };

  const handleResend = async () => {
    try {
      const signupDataStr = await AsyncStorage.getItem('signupData');
      const resendEmail = await AsyncStorage.getItem('resendVerificationEmail');

      if (signupDataStr) {
        const signupData = JSON.parse(signupDataStr);
        await authApi.sendOtp({ email: signupData.email });
      } else if (resendEmail) {
        await authApi.sendOtp({ email: resendEmail });
      } else {
        showToast('Session expired. Please start signup again.', 'error');
        router.replace('/auth/signup');
        return;
      }

      setOtp(['', '', '', '', '', '']);
      setTimer(59);
      setError('');
      showToast('New verification code sent!', 'success');
    } catch (err) {
      const errorMessage = parseBackendError(err);
      showToast(errorMessage, 'error');
    }
  };

  const isComplete = otp.every(digit => digit !== '');
  const formattedTime = `0:${timer.toString().padStart(2, '0')}`;

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.white}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.logo}>JENDO</Text>
        </View>

        <View style={styles.contentTop}>
          <View style={styles.iconContainerSmall}>
            <View style={styles.iconCircleSmall}>
              <Ionicons name="mail-outline" size={40} color={COLORS.primary} />
            </View>
          </View>

          <Text style={styles.title}>Verify Code</Text>
          <Text style={styles.subtitle}>
            We've sent a verification code to your email. Please enter the code below.
          </Text>

          {error && (
            <View style={localStyles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#FF5252" />
              <Text style={localStyles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[
                  styles.otpInput, 
                  digit && styles.otpInputFilled,
                  error && localStyles.otpInputError
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                cursorColor={COLORS.primary}
                selectionColor={COLORS.primary}
              />
            ))}
          </View>

          {timer > 0 ? (
            <Text style={styles.timerText}>Resend code in {formattedTime}</Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend Code</Text>
            </TouchableOpacity>
          )}

          <Button
            title="Verify Code"
            onPress={handleVerify}
            loading={loading}
            disabled={!isComplete}
            style={styles.verifyButton}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

const localStyles = StyleSheet.create({
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#FF5252',
    padding: SPACING.md,
    borderRadius: SPACING.xs,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  errorText: {
    flex: 1,
    color: '#C62828',
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: 20,
  },
  otpInputError: {
    borderColor: '#FF5252',
    borderWidth: 2,
  },
});
