import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { Button, Input } from '../../../common/components/ui';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../config/theme.config';
import { authStyles as styles } from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/authApi';
import { useToast } from '../../../providers/ToastProvider';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  general?: string;
}

export const SignupScreen: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{8,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain letters and numbers';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreed) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return newErrors;
  };

  const parseBackendError = (error: any): { field?: keyof FormErrors; message: string } => {
    // Check for HTTP status codes
    const statusCode = error?.response?.status || error?.status;
    
    // 400 Bad Request or 409 Conflict - typically used for duplicate resources
    if (statusCode === 400 || statusCode === 409) {
      return { field: 'email', message: 'An account with this email already exists' };
    }

    const errorMessage = error?.message || error?.response?.data?.message || error?.response?.data?.error || 'An error occurred';
    const errorStr = errorMessage.toLowerCase();

    // Check for status code in error message
    if (errorStr.includes('status code 400') || errorStr.includes('400') ||
        errorStr.includes('status code 409') || errorStr.includes('409')) {
      return { field: 'email', message: 'An account with this email already exists' };
    }

    // Email already exists - comprehensive check
    if (errorStr.includes('email')) {
      if (errorStr.includes('exists') || 
          errorStr.includes('already') || 
          errorStr.includes('registered') ||
          errorStr.includes('taken') ||
          errorStr.includes('duplicate') ||
          errorStr.includes('in use') ||
          errorStr.includes('used')) {
        return { field: 'email', message: 'An account with this email already exists' };
      }
    }

    // Check for generic duplicate/conflict messages
    if (errorStr.includes('duplicate') || 
        errorStr.includes('already exists') ||
        errorStr.includes('already registered')) {
      return { field: 'email', message: 'An account with this email already exists' };
    }

    // Phone already exists
    if (errorStr.includes('phone') && (errorStr.includes('exists') || 
        errorStr.includes('already') || 
        errorStr.includes('registered') ||
        errorStr.includes('in use'))) {
      return { field: 'phone', message: 'This phone number is already registered' };
    }

    // Email validation from backend
    if (errorStr.includes('invalid email') || errorStr.includes('email format')) {
      return { field: 'email', message: 'Please enter a valid email address' };
    }

    // Password validation from backend
    if (errorStr.includes('password') && (errorStr.includes('weak') || 
        errorStr.includes('must contain') || 
        errorStr.includes('minimum'))) {
      return { field: 'password', message: errorMessage };
    }

    return { message: errorMessage };
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field] || errors.general) {
      setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
    }
  };

  const handleSignup = async () => {
    const validationErrors = validate();
    const errorMessages = Object.values(validationErrors).filter(Boolean);
    if (errorMessages.length > 0) {
      showToast(errorMessages[0] || 'Please fill in all required fields', 'error');
      return;
    }
    
    setLoading(true);
    setErrors({}); // Clear previous errors
    
    try {
      await AsyncStorage.setItem('signupData', JSON.stringify(formData));
      await authApi.sendOtp({ email: formData.email.trim() });
      setLoading(false);
      showToast('OTP sent to your email!', 'success');
      router.push('/auth/verify-otp');
    } catch (err) {
      setLoading(false);
      const { field, message } = parseBackendError(err);
      
      if (field && field !== 'general') {
        setErrors({ [field]: message });
      } else if (field === 'general') {
        setErrors({ general: message });
      } else {
        // If no specific field, show as general error
        setErrors({ general: message });
      }
      
      showToast(message, 'error');
      // Don't navigate to OTP page if there's an error
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

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.white}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.logo}>JENDO</Text>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.titleSmall}>Create Account</Text>
            <Text style={styles.subtitleLeft}>Please fill in your details to get started</Text>
          </View>

          <View style={styles.form}>
            {errors.general && (
              <View style={localStyles.generalErrorContainer}>
                <Ionicons name="alert-circle" size={20} color="#FF5252" />
                <Text style={localStyles.generalErrorText}>{errors.general}</Text>
              </View>
            )}

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>First Name</Text>
                <View style={[styles.inputWrapper, errors.firstName && localStyles.inputError]}>
                  <Ionicons name="person-outline" size={18} color={errors.firstName ? '#FF5252' : COLORS.textSecondary} style={styles.inputIcon} />
                  <Input
                    value={formData.firstName}
                    onChangeText={(v) => updateField('firstName', v)}
                    placeholder="John"
                    autoCapitalize="words"
                    style={styles.input}
                  />
                </View>
                {errors.firstName && <Text style={localStyles.errorText}>{errors.firstName}</Text>}
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <View style={[styles.inputWrapper, errors.lastName && localStyles.inputError]}>
                  <Ionicons name="person-outline" size={18} color={errors.lastName ? '#FF5252' : COLORS.textSecondary} style={styles.inputIcon} />
                  <Input
                    value={formData.lastName}
                    onChangeText={(v) => updateField('lastName', v)}
                    placeholder="Doe"
                    autoCapitalize="words"
                    style={styles.input}
                  />
                </View>
                {errors.lastName && <Text style={localStyles.errorText}>{errors.lastName}</Text>}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[styles.inputWrapper, errors.email && localStyles.inputError]}>
                <Ionicons name="mail-outline" size={18} color={errors.email ? '#FF5252' : COLORS.textSecondary} style={styles.inputIcon} />
                <Input
                  value={formData.email}
                  onChangeText={(v) => updateField('email', v)}
                  placeholder="john.doe@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>
              {errors.email && <Text style={localStyles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={[styles.inputWrapper, errors.phone && localStyles.inputError]}>
                <Ionicons name="call-outline" size={18} color={errors.phone ? '#FF5252' : COLORS.textSecondary} style={styles.inputIcon} />
                <Input
                  value={formData.phone}
                  onChangeText={(v) => updateField('phone', v)}
                  placeholder="+94 77 123 4567"
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              </View>
              {errors.phone && <Text style={localStyles.errorText}>{errors.phone}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputWrapper, errors.password && localStyles.inputError]}>
                <Ionicons name="lock-closed-outline" size={18} color={errors.password ? '#FF5252' : COLORS.textSecondary} style={styles.inputIcon} />
                <Input
                  value={formData.password}
                  onChangeText={(v) => updateField('password', v)}
                  placeholder="Create a strong password"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={localStyles.errorText}>{errors.password}</Text>}
              
              {formData.password.length > 0 && (
                <View style={localStyles.strengthContainer}>
                  <View style={localStyles.strengthBarBg}>
                    <View style={[localStyles.strengthBar, { width: passwordStrength.width as any, backgroundColor: passwordStrength.color }]} />
                  </View>
                  <Text style={[localStyles.strengthText, { color: passwordStrength.color }]}>
                    {passwordStrength.strength}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={[styles.inputWrapper, errors.confirmPassword && localStyles.inputError]}>
                <Ionicons name="lock-closed-outline" size={18} color={errors.confirmPassword ? '#FF5252' : COLORS.textSecondary} style={styles.inputIcon} />
                <Input
                  value={formData.confirmPassword}
                  onChangeText={(v) => updateField('confirmPassword', v)}
                  placeholder="Confirm your password"
                  secureTextEntry={!showConfirmPassword}
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={localStyles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            <TouchableOpacity 
              style={styles.termsRow}
              onPress={() => {
                setAgreed(!agreed);
                if (errors.terms) setErrors({...errors, terms: undefined});
              }}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxChecked, errors.terms && localStyles.checkboxError]}>
                {agreed && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {errors.terms && <Text style={localStyles.errorText}>{errors.terms}</Text>}

            <Button
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              style={styles.primaryButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  checkboxError: {
    borderColor: '#FF5252',
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  strengthBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
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
});
