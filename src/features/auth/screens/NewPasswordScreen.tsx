import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { Button, Input } from '../../../common/components/ui';
import { COLORS } from '../../../config/theme.config';
import { authStyles as styles } from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/authApi';
import { useToast } from '../../../providers/ToastProvider';

export const NewPasswordScreen: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const storedEmail = await AsyncStorage.getItem('passwordResetEmail');
      const storedOtp = await AsyncStorage.getItem('passwordResetOTP');
      
      if (!storedEmail || !storedOtp) {
        showToast('Session expired. Please try again.', 'error');
        router.replace('/auth/forgot-password');
        return;
      }
      
      setEmail(storedEmail);
      setOtp(storedOtp);
    };
    loadData();
  }, []);

  const validatePassword = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain letters and numbers';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        email,
        otp,
        newPassword: password,
      });
      
      await AsyncStorage.removeItem('passwordResetEmail');
      await AsyncStorage.removeItem('passwordResetOTP');
      
      showToast('Password reset successfully!', 'success');
      router.replace('/auth/login');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: COLORS.textMuted };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { level: strength, label: 'Weak', color: COLORS.error };
    if (strength <= 3) return { level: strength, label: 'Medium', color: '#FFA500' };
    return { level: strength, label: 'Strong', color: COLORS.success };
  };

  const passwordStrength = getPasswordStrength();

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
              <Ionicons name="key-outline" size={40} color={COLORS.primary} />
            </View>
          </View>

          <Text style={styles.title}>Create New Password</Text>
          <Text style={styles.subtitle}>
            Your new password must be different from your previous password.
          </Text>

          <View style={styles.form}>
            <View style={styles.inputContainerLarge}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={[styles.inputWrapper, errors.password ? { borderColor: COLORS.error } : {}]}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <Input
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Enter new password"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                    size={20} 
                    color={COLORS.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={{ color: COLORS.error, fontSize: 12, marginTop: 4 }}>{errors.password}</Text>
              ) : null}
              
              {password.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ flex: 1, height: 4, backgroundColor: COLORS.border, borderRadius: 2 }}>
                      <View 
                        style={{ 
                          width: `${(passwordStrength.level / 5) * 100}%`, 
                          height: '100%', 
                          backgroundColor: passwordStrength.color,
                          borderRadius: 2 
                        }} 
                      />
                    </View>
                    <Text style={{ fontSize: 12, color: passwordStrength.color }}>{passwordStrength.label}</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.inputContainerLarge}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={[styles.inputWrapper, errors.confirmPassword ? { borderColor: COLORS.error } : {}]}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <Input
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                  }}
                  placeholder="Confirm new password"
                  secureTextEntry={!showConfirmPassword}
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} 
                    size={20} 
                    color={COLORS.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <Text style={{ color: COLORS.error, fontSize: 12, marginTop: 4 }}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            <Button
              title="Reset Password"
              onPress={handleSubmit}
              loading={loading}
              style={styles.primaryButton}
            />
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};
