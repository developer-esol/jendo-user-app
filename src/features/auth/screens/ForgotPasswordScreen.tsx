import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { Button, Input } from '../../../common/components/ui';
import { COLORS } from '../../../config/theme.config';
import { authStyles as styles } from '../components';
import { authApi } from '../services/authApi';
import { useToast } from '../../../providers/ToastProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ForgotPasswordScreen: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateEmail()) {
      showToast(error || 'Please check your email', 'error');
      return;
    }

    setLoading(true);
    try {
      await authApi.requestPasswordReset({ email: email.trim() });
      await AsyncStorage.setItem('passwordResetEmail', email.trim());
      showToast('OTP sent to your email', 'success');
      router.push('/auth/reset-password-otp');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

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
              <Ionicons name="lock-closed-outline" size={40} color={COLORS.primary} />
            </View>
          </View>

          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a code to reset your password.
          </Text>

          <View style={styles.form}>
            <View style={styles.inputContainerLarge}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[styles.inputWrapper, error ? { borderColor: COLORS.error } : {}]}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <Input
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError('');
                  }}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>
              {error ? <Text style={{ color: COLORS.error, fontSize: 12, marginTop: 4 }}>{error}</Text> : null}
            </View>

            <Button
              title="Send Reset Code"
              onPress={handleSubmit}
              loading={loading}
              style={styles.primaryButton}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Remember your password? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
};
