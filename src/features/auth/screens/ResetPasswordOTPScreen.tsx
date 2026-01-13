import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { Button } from '../../../common/components/ui';
import { COLORS } from '../../../config/theme.config';
import { authStyles as styles } from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/authApi';
import { useToast } from '../../../providers/ToastProvider';

export const ResetPasswordOTPScreen: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  const [email, setEmail] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const loadEmail = async () => {
      const storedEmail = await AsyncStorage.getItem('passwordResetEmail');
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        showToast('Email not found. Please try again.', 'error');
        router.replace('/auth/forgot-password');
      }
    };
    loadEmail();
  }, []);

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

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const otpCode = otp.join('');
      
      if (!email) {
        showToast('Session expired. Please try again.', 'error');
        router.replace('/auth/forgot-password');
        return;
      }
      
      if (otpCode.length !== 6) {
        showToast('Please enter a 6-digit OTP', 'error');
        setLoading(false);
        return;
      }
      
      if (!/^\d{6}$/.test(otpCode)) {
        showToast('OTP must contain only digits', 'error');
        setLoading(false);
        return;
      }
      
      await AsyncStorage.setItem('passwordResetOTP', otpCode);
      router.push('/auth/new-password');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to proceed. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      showToast('Session expired. Please try again.', 'error');
      router.replace('/auth/forgot-password');
      return;
    }
    
    try {
      await authApi.requestPasswordReset({ email });
      setOtp(['', '', '', '', '', '']);
      setTimer(59);
      showToast('New OTP sent to your email', 'success');
    } catch (err) {
      showToast('Failed to resend OTP', 'error');
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
            We've sent a verification code to {email}. Please enter the code below.
          </Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[styles.otpInput, digit && styles.otpInputFilled]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
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
