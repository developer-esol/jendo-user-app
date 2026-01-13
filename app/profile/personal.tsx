import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../src/common/components/layout';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../src/config/theme.config';
import { useUserStore } from '../../src/state/userSlice';
import { authApi } from '../../src/features/auth/services/authApi';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  editable: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  suffix?: string;
  placeholder?: string;
  error?: string;
}

const FormInput: React.FC<FormInputProps> = ({ 
  label, 
  value, 
  onChangeText, 
  editable,
  keyboardType = 'default',
  suffix,
  placeholder,
  error
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        editable && styles.inputContainerEditing,
        error && styles.inputContainerError
      ]}>
        <TextInput
          style={[
            styles.input, 
            !editable && styles.inputDisabled,
            isFocused && styles.inputFocused
          ]}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          selectionColor={COLORS.primary}
          cursorColor={COLORS.primary}
        />
        {suffix && <Text style={[styles.suffix, isFocused && styles.suffixFocused]}>{suffix}</Text>}
        {editable && !suffix && (
          <MaterialCommunityIcons 
            name="pencil" 
            size={18} 
            color={isFocused ? COLORS.primary : COLORS.textMuted} 
          />
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

interface GenderDropdownProps {
  value: string;
  onSelect: (value: string) => void;
  editable: boolean;
  error?: string;
}

const GenderDropdown: React.FC<GenderDropdownProps> = ({ value, onSelect, editable, error }) => {
  const [showModal, setShowModal] = useState(false);
  const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Gender</Text>
      <TouchableOpacity 
        style={[
          styles.inputContainer,
          editable && styles.inputContainerEditing,
          error && styles.inputContainerError
        ]}
        onPress={() => editable && setShowModal(true)}
        disabled={!editable}
      >
        <Text style={[styles.input, !value && styles.placeholderText]}>
          {value || 'Select gender'}
        </Text>
        {editable && <Ionicons name="chevron-down" size={20} color={COLORS.textMuted} />}
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={showModal} transparent animationType="slide">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            {genders.map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[styles.modalOption, value === gender && styles.modalOptionSelected]}
                onPress={() => {
                  onSelect(gender);
                  setShowModal(false);
                }}
              >
                <Text style={[styles.modalOptionText, value === gender && styles.modalOptionTextSelected]}>
                  {gender}
                </Text>
                {value === gender && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  editable: boolean;
  error?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, editable, error }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - 25);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);

  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          setSelectedYear(year);
          setSelectedMonth(month);
          setSelectedDay(day);
        }
      }
    }
  }, [value]);

  const formatDisplayDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return '';
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[month - 1]} ${day}, ${year}`;
  };

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();
  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

  const handleConfirm = () => {
    const isoDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    onChange(isoDate);
    setShowModal(false);
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Date of Birth</Text>
      <TouchableOpacity 
        style={[
          styles.inputContainer,
          editable && styles.inputContainerEditing,
          error && styles.inputContainerError
        ]}
        onPress={() => editable && setShowModal(true)}
        disabled={!editable}
      >
        <Text style={[styles.input, !value && styles.placeholderText]}>
          {formatDisplayDate(value) || 'Select date of birth'}
        </Text>
        {editable && <Ionicons name="calendar" size={20} color={COLORS.textMuted} />}
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={showModal} transparent animationType="slide">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowModal(false)}
        >
          <View style={styles.datePickerContent}>
            <Text style={styles.modalTitle}>Select Date of Birth</Text>
            
            <View style={styles.datePickerRow}>
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Year</Text>
                <ScrollView style={styles.datePickerScroll} showsVerticalScrollIndicator={false}>
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[styles.datePickerOption, selectedYear === year && styles.datePickerOptionSelected]}
                      onPress={() => setSelectedYear(year)}
                    >
                      <Text style={[styles.datePickerOptionText, selectedYear === year && styles.datePickerOptionTextSelected]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Month</Text>
                <ScrollView style={styles.datePickerScroll} showsVerticalScrollIndicator={false}>
                  {months.map((month, idx) => (
                    <TouchableOpacity
                      key={month}
                      style={[styles.datePickerOption, selectedMonth === idx + 1 && styles.datePickerOptionSelected]}
                      onPress={() => setSelectedMonth(idx + 1)}
                    >
                      <Text style={[styles.datePickerOptionText, selectedMonth === idx + 1 && styles.datePickerOptionTextSelected]}>
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Day</Text>
                <ScrollView style={styles.datePickerScroll} showsVerticalScrollIndicator={false}>
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[styles.datePickerOption, selectedDay === day && styles.datePickerOptionSelected]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <Text style={[styles.datePickerOptionText, selectedDay === day && styles.datePickerOptionTextSelected]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.datePickerButtons}>
              <TouchableOpacity style={styles.datePickerCancel} onPress={() => setShowModal(false)}>
                <Text style={styles.datePickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.datePickerConfirm} onPress={handleConfirm}>
                <Text style={styles.datePickerConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  weight?: string;
  height?: string;
}

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { user, updateUser } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    email: '',
    gender: '',
    address: '',
    nationality: '',
    weight: '',
    height: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: [user.firstName, user.lastName].filter(Boolean).join(' ') || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        email: user.email || '',
        gender: user.gender || '',
        address: user.address || '',
        nationality: user.nationality || '',
        weight: user.weight?.toString() || '',
        height: user.height?.toString() || '',
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (formData.phone && !/^\+?[\d\s-]{8,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.weight) {
      const weight = parseFloat(formData.weight);
      if (isNaN(weight) || weight < 20 || weight > 300) {
        newErrors.weight = 'Weight must be between 20-300 kg';
      }
    }

    if (formData.height) {
      const height = parseFloat(formData.height);
      if (isNaN(height) || height < 50 || height > 250) {
        newErrors.height = 'Height must be between 50-250 cm';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors before saving');
      return;
    }

    setLoading(true);
    try {
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || user?.firstName || '';
      const lastName = nameParts.slice(1).join(' ') || user?.lastName;
      
      const updates: Record<string, any> = {};
      
      if (firstName && firstName !== user?.firstName) {
        updates.firstName = firstName;
      }
      if (lastName !== undefined && lastName !== user?.lastName) {
        updates.lastName = lastName;
      }
      if (formData.phone !== user?.phone) {
        updates.phone = formData.phone || null;
      }
      if (formData.gender !== user?.gender) {
        updates.gender = formData.gender || null;
      }
      if (formData.address !== user?.address) {
        updates.address = formData.address || null;
      }
      if (formData.nationality !== user?.nationality) {
        updates.nationality = formData.nationality || null;
      }
      if (formData.dateOfBirth !== user?.dateOfBirth) {
        updates.dateOfBirth = formData.dateOfBirth || null;
      }
      const currentWeight = user?.weight?.toString() || '';
      if (formData.weight !== currentWeight) {
        if (formData.weight) {
          const weightNum = parseFloat(formData.weight);
          if (!isNaN(weightNum)) {
            updates.weight = weightNum;
          }
        } else {
          updates.weight = null;
        }
      }
      const currentHeight = user?.height?.toString() || '';
      if (formData.height !== currentHeight) {
        if (formData.height) {
          const heightNum = parseFloat(formData.height);
          if (!isNaN(heightNum)) {
            updates.height = heightNum;
          }
        } else {
          updates.height = null;
        }
      }
      
      if (Object.keys(updates).length === 0) {
        setIsEditing(false);
        return;
      }
      
      const updatedUser = await authApi.updateProfile(updates);
      updateUser(updatedUser);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: [user.firstName, user.lastName].filter(Boolean).join(' ') || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        email: user.email || '',
        gender: user.gender || '',
        address: user.address || '',
        nationality: user.nationality || '',
        weight: user.weight?.toString() || '',
        height: user.height?.toString() || '',
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.white}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.mainCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEditToggle}
            >
              <Ionicons name={isEditing ? "checkmark" : "pencil"} size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <FormInput
            label="Full Name"
            value={formData.fullName}
            onChangeText={(text) => {
              setFormData({...formData, fullName: text});
              if (errors.fullName) setErrors({...errors, fullName: undefined});
            }}
            editable={isEditing}
            placeholder="Enter your full name"
            error={errors.fullName}
          />

          <FormInput
            label="Phone"
            value={formData.phone}
            onChangeText={(text) => {
              setFormData({...formData, phone: text});
              if (errors.phone) setErrors({...errors, phone: undefined});
            }}
            editable={isEditing}
            keyboardType="phone-pad"
            placeholder="e.g., +94 77 123 4567"
            error={errors.phone}
          />

          <DatePicker
            value={formData.dateOfBirth}
            onChange={(date) => setFormData({...formData, dateOfBirth: date})}
            editable={isEditing}
          />

          <FormInput
            label="Email Address"
            value={formData.email}
            onChangeText={(text) => {
              setFormData({...formData, email: text});
              if (errors.email) setErrors({...errors, email: undefined});
            }}
            editable={isEditing}
            keyboardType="email-address"
            placeholder="e.g., john@example.com"
            error={errors.email}
          />

          <GenderDropdown
            value={formData.gender}
            onSelect={(value) => setFormData({...formData, gender: value})}
            editable={isEditing}
          />

          <View style={styles.rowInputs}>
            <View style={styles.halfInput}>
              <FormInput
                label="Weight"
                value={formData.weight}
                onChangeText={(text) => {
                  setFormData({...formData, weight: text});
                  if (errors.weight) setErrors({...errors, weight: undefined});
                }}
                editable={isEditing}
                keyboardType="numeric"
                suffix="kg"
                placeholder="e.g., 70"
                error={errors.weight}
              />
            </View>
            <View style={styles.halfInput}>
              <FormInput
                label="Height"
                value={formData.height}
                onChangeText={(text) => {
                  setFormData({...formData, height: text});
                  if (errors.height) setErrors({...errors, height: undefined});
                }}
                editable={isEditing}
                keyboardType="numeric"
                suffix="cm"
                placeholder="e.g., 175"
                error={errors.height}
              />
            </View>
          </View>

          <FormInput
            label="Address"
            value={formData.address}
            onChangeText={(text) => setFormData({...formData, address: text})}
            editable={isEditing}
            placeholder="Enter your address"
          />

          <FormInput
            label="Nationality"
            value={formData.nationality}
            onChangeText={(text) => setFormData({...formData, nationality: text})}
            editable={isEditing}
            placeholder="e.g., Sri Lankan"
          />
        </View>

        {isEditing ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
              <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.backToProfileButton} onPress={() => router.back()}>
            <Text style={styles.backToProfileText}>Back to Profile</Text>
          </TouchableOpacity>
        )}
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  editButton: {
    marginLeft: 'auto',
    padding: SPACING.xs,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  inputContainerEditing: {
    borderBottomColor: COLORS.border,
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
  inputDisabled: {
    color: COLORS.textPrimary,
  },
  placeholderText: {
    color: COLORS.textMuted,
  },
  suffix: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  suffixFocused: {
    color: COLORS.primary,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#FF5252',
    marginTop: 4,
  },
  backToProfileButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  backToProfileText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.textSecondary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  modalOptionSelected: {
    backgroundColor: '#F3E5F5',
  },
  modalOptionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  modalOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalCancel: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  modalCancelText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  datePickerContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  datePickerRow: {
    flexDirection: 'row',
    height: 200,
    marginBottom: SPACING.md,
  },
  datePickerColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  datePickerLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  datePickerScroll: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: BORDER_RADIUS.md,
  },
  datePickerOption: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    alignItems: 'center',
  },
  datePickerOptionSelected: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    marginHorizontal: 2,
  },
  datePickerOptionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
  },
  datePickerOptionTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  datePickerButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  datePickerCancel: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.lg,
  },
  datePickerCancelText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  datePickerConfirm: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
  },
  datePickerConfirmText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.white,
    fontWeight: '600',
  },
});
