import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, Modal, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { Button, Input } from '../../../common/components/ui';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../config/theme.config';
import { authStyles as styles } from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from '../../../providers/ToastProvider';
import { authApi } from '../services/authApi';

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
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

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
    } else {
      const phone = formData.phone.trim();
      // Remove spaces and dashes for validation
      const cleanPhone = phone.replace(/[\s-]/g, '');
      
      if (!/^\+?\d+$/.test(cleanPhone)) {
        newErrors.phone = 'Phone number can only contain digits, spaces, dashes, and +';
      } else if (cleanPhone.startsWith('+') && cleanPhone.length < 11) {
        newErrors.phone = 'International phone number must be at least 10 digits';
      } else if (!cleanPhone.startsWith('+') && cleanPhone.length < 10) {
        newErrors.phone = 'Phone number must be at least 10 digits';
      } else if (cleanPhone.length > 15) {
        newErrors.phone = 'Phone number cannot exceed 15 digits';
      } else if (cleanPhone.startsWith('+94') && cleanPhone.length !== 12) {
        newErrors.phone = 'Sri Lankan number should be in format +94XXXXXXXXX (12 digits total)';
      }
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

  const handleTermsPress = () => {
    setShowTermsModal(true);
  };

  const handlePrivacyPress = () => {
    setShowPrivacyModal(true);
  };

  const handleAcceptTerms = () => {
    setAgreed(true);
    setShowTermsModal(false);
    setShowPrivacyModal(false);
    if (errors.terms) setErrors({...errors, terms: undefined});
    showToast('Thank you for accepting our terms', 'success');
  };

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

            <View style={localStyles.termsContainer}>
              <TouchableOpacity 
                style={localStyles.termsRow}
                onPress={() => {
                  setAgreed(!agreed);
                  if (errors.terms) setErrors({...errors, terms: undefined});
                }}
              >
                <View style={[styles.checkbox, agreed && styles.checkboxChecked, errors.terms && localStyles.checkboxError]}>
                  {agreed && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
                </View>
                <View style={localStyles.termsTextContainer}>
                  <Text style={localStyles.termsTextStyle}>I agree to the </Text>
                  <TouchableOpacity onPress={handleTermsPress}>
                    <Text style={[styles.termsLink, localStyles.clickableLink]}>Terms of Service</Text>
                  </TouchableOpacity>
                  <Text style={localStyles.termsTextStyle}> and </Text>
                  <TouchableOpacity onPress={handlePrivacyPress}>
                    <Text style={[styles.termsLink, localStyles.clickableLink]}>Privacy Policy</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              {errors.terms && <Text style={localStyles.errorText}>{errors.terms}</Text>}
            </View>

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

      {/* Privacy Policy Modal - Adding comprehensive content */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={localStyles.modalContainer}>
          <View style={localStyles.modalHeader}>
            <Text style={localStyles.modalTitle}>Privacy Policy</Text>
            <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
              <Ionicons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={localStyles.modalContent} showsVerticalScrollIndicator={true}>
            <Text style={localStyles.lastUpdated}>Last Updated: January 15, 2026</Text>
            
            <Text style={localStyles.sectionText}>
              Welcome to Jendo Health. We are committed to protecting your privacy and ensuring the security of your personal health information in accordance with the Personal Data Protection Act No. 9 of 2022 of Sri Lanka.
            </Text>

            <Text style={localStyles.sectionTitle}>1. Information We Collect</Text>
            <Text style={localStyles.subTitle}>1.1 Personal Information</Text>
            <Text style={localStyles.bulletPoint}>• Account Information: Name, email, phone, date of birth</Text>
            <Text style={localStyles.bulletPoint}>• Health Information: Medical records, test results, medications</Text>
            <Text style={localStyles.bulletPoint}>• Profile Information: Photo, health preferences, settings</Text>

            <Text style={localStyles.sectionTitle}>2. How We Use Your Information</Text>
            <Text style={localStyles.bulletPoint}>• Providing health tracking and medical record management</Text>
            <Text style={localStyles.bulletPoint}>• Facilitating doctor consultations</Text>
            <Text style={localStyles.bulletPoint}>• Managing appointments and test results</Text>

            <Text style={localStyles.sectionTitle}>3. Data Security</Text>
            <Text style={localStyles.bulletPoint}>• Industry-standard SSL/TLS encryption (AES-256)</Text>
            <Text style={localStyles.bulletPoint}>• Secure, encrypted server storage</Text>
            <Text style={localStyles.bulletPoint}>• Multi-factor authentication for staff access</Text>

            <Text style={localStyles.sectionTitle}>4. Your Rights</Text>
            <Text style={localStyles.bulletPoint}>• Right to Access: Request a copy of your personal data</Text>
            <Text style={localStyles.bulletPoint}>• Right to Rectification: Correct inaccurate data</Text>
            <Text style={localStyles.bulletPoint}>• Right to Erasure: Request deletion of your data</Text>

            <Text style={localStyles.sectionTitle}>5. Contact Us</Text>
            <Text style={localStyles.bulletPoint}>• Email: info@jendoinnovations.com</Text>
            <Text style={localStyles.bulletPoint}>• Phone: +94 76 621 0120</Text>

            <View style={localStyles.spacer} />
          </ScrollView>

          <View style={localStyles.modalFooter}>
            <Button
              title="Accept & Continue"
              onPress={handleAcceptTerms}
              style={localStyles.acceptButton}
            />
            <TouchableOpacity onPress={() => setShowPrivacyModal(false)} style={localStyles.declineButton}>
              <Text style={localStyles.declineText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={localStyles.modalContainer}>
          <View style={localStyles.modalHeader}>
            <Text style={localStyles.modalTitle}>Terms of Service</Text>
            <TouchableOpacity onPress={() => setShowTermsModal(false)}>
              <Ionicons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={localStyles.modalContent} showsVerticalScrollIndicator={true}>
            <Text style={localStyles.lastUpdated}>Last Updated: January 9, 2026</Text>
            
            <Text style={localStyles.sectionText}>
              Welcome to Jendo Health. By using our application, you agree to these Terms of Service.
            </Text>

            <Text style={localStyles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={localStyles.sectionText}>
              By accessing or using Jendo Health, you agree to be bound by these Terms. If you disagree with any part, you may not use our services.
            </Text>

            <Text style={localStyles.sectionTitle}>2. Medical Disclaimer</Text>
            <Text style={localStyles.sectionText}>
              Jendo Health provides health information and tracking tools but does not provide medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals.
            </Text>

            <Text style={localStyles.sectionTitle}>3. User Responsibilities</Text>
            <Text style={localStyles.bulletPoint}>• Provide accurate health information</Text>
            <Text style={localStyles.bulletPoint}>• Maintain account security and confidentiality</Text>
            <Text style={localStyles.bulletPoint}>• Use services lawfully and respectfully</Text>

            <Text style={localStyles.sectionTitle}>4. Account Registration</Text>
            <Text style={localStyles.sectionText}>
              You must provide accurate information during registration. You are responsible for maintaining the confidentiality of your account credentials.
            </Text>

            <Text style={localStyles.sectionTitle}>5. Contact Information</Text>
            <Text style={localStyles.bulletPoint}>• Email: info@jendoinnovations.com</Text>
            <Text style={localStyles.bulletPoint}>• Phone: +94 76 621 0120</Text>

            <View style={localStyles.spacer} />
          </ScrollView>

          <View style={localStyles.modalFooter}>
            <Button
              title="Accept & Continue"
              onPress={handleAcceptTerms}
              style={localStyles.acceptButton}
            />
            <TouchableOpacity onPress={() => setShowTermsModal(false)} style={localStyles.declineButton}>
              <Text style={localStyles.declineText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  termsContainer: {
    marginBottom: SPACING.md,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingTop: 2,
  },
  termsTextStyle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  clickableLink: {
    textDecorationLine: 'underline',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: COLORS.white,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  lastUpdated: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  subTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  sectionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  bulletPoint: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: SPACING.xs,
    paddingLeft: SPACING.sm,
  },
  boldText: {
    fontWeight: '700',
  },
  highlightBox: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: '#FFF3E0',
    padding: SPACING.md,
    borderRadius: SPACING.xs,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    marginVertical: SPACING.md,
  },
  highlightText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#E65100',
    lineHeight: 20,
  },
  spacer: {
    height: SPACING.xl * 2,
  },
  modalFooter: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: COLORS.white,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  declineButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  declineText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
