import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../src/common/components/layout';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../src/config/theme.config';
import { authApi } from '../../src/features/auth/services/authApi';
import { useToast } from '../../src/providers/ToastProvider';

interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  hint?: string;
  error?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder,
  hint,
  error
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError
      ]}>
        <TextInput
          style={[styles.input, isFocused && styles.inputFocused]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          selectionColor={COLORS.primary}
          cursorColor={COLORS.primary}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons 
            name={showPassword ? "eye" : "eye-off"} 
            size={20} 
            color={isFocused ? COLORS.primary : COLORS.textMuted} 
          />
        </TouchableOpacity>
      </View>
      {hint && !error && <Text style={styles.inputHint}>{hint}</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain letters and numbers';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdatePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      
      showToast('Password updated successfully!', 'success', 3000);
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update password';
      if (errorMessage.toLowerCase().includes('incorrect') || errorMessage.toLowerCase().includes('wrong')) {
        setErrors({ currentPassword: 'Current password is incorrect' });
        showToast('Current password is incorrect', 'error');
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: string; color: string; width: string } => {
    if (!password) return { strength: '', color: 'transparent', width: '0%' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score <= 2) return { strength: 'Weak', color: '#F44336', width: '33%' };
    if (score <= 3) return { strength: 'Medium', color: '#FF9800', width: '66%' };
    return { strength: 'Strong', color: '#4CAF50', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.white}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.mainCard}>
          <PasswordInput
            label="Current Password"
            value={formData.currentPassword}
            onChangeText={(text) => {
              setFormData({...formData, currentPassword: text});
              if (errors.currentPassword) setErrors({...errors, currentPassword: undefined});
            }}
            placeholder="Enter current password"
            error={errors.currentPassword}
          />

          <PasswordInput
            label="New Password"
            value={formData.newPassword}
            onChangeText={(text) => {
              setFormData({...formData, newPassword: text});
              if (errors.newPassword) setErrors({...errors, newPassword: undefined});
            }}
            placeholder="Enter new password"
            hint="Minimum 8 characters with letters and numbers"
            error={errors.newPassword}
          />

          {formData.newPassword.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBarBg}>
                <View style={[styles.strengthBar, { width: passwordStrength.width, backgroundColor: passwordStrength.color }]} />
              </View>
              <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                {passwordStrength.strength}
              </Text>
            </View>
          )}

          <PasswordInput
            label="Confirm New Password"
            value={formData.confirmPassword}
            onChangeText={(text) => {
              setFormData({...formData, confirmPassword: text});
              if (errors.confirmPassword) setErrors({...errors, confirmPassword: undefined});
            }}
            placeholder="Confirm new password"
            error={errors.confirmPassword}
          />
        </View>

        <View style={styles.requirementsCard}>
          <View style={styles.requirementsHeader}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
            <Text style={styles.requirementsTitle}>Password Requirements</Text>
          </View>
          <View style={styles.requirementsList}>
            <View style={styles.requirementItem}>
              <Ionicons 
                name={formData.newPassword.length >= 8 ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={formData.newPassword.length >= 8 ? '#4CAF50' : COLORS.textMuted} 
              />
              <Text style={[
                styles.requirementText,
                formData.newPassword.length >= 8 && styles.requirementMet
              ]}>
                At least 8 characters
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons 
                name={/[a-zA-Z]/.test(formData.newPassword) ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={/[a-zA-Z]/.test(formData.newPassword) ? '#4CAF50' : COLORS.textMuted} 
              />
              <Text style={[
                styles.requirementText,
                /[a-zA-Z]/.test(formData.newPassword) && styles.requirementMet
              ]}>
                Contains letters
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons 
                name={/\d/.test(formData.newPassword) ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={/\d/.test(formData.newPassword) ? '#4CAF50' : COLORS.textMuted} 
              />
              <Text style={[
                styles.requirementText,
                /\d/.test(formData.newPassword) && styles.requirementMet
              ]}>
                Contains numbers
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.updateButton, loading && styles.updateButtonDisabled]} 
          onPress={handleUpdatePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.updateButtonText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5E5',
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.primary,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  mainCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  inputContainerFocused: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  inputContainerError: {
    borderBottomColor: '#FF5252',
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  inputFocused: {
    color: COLORS.primary,
  },
  inputHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#FF5252',
    marginTop: SPACING.xs,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  strengthBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.borderLight,
    borderRadius: 2,
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
  },
  requirementsCard: {
    backgroundColor: '#F3E5F5',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  requirementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  requirementsTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  requirementsList: {
    gap: SPACING.xs,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  requirementText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  requirementMet: {
    color: '#4CAF50',
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});
