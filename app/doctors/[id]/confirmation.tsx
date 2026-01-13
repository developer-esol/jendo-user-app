import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../src/common/components/layout';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../../src/config/theme.config';

type ConsultationType = 'in-person' | 'video' | 'chat';

const getConsultationDetails = (type: ConsultationType) => {
  switch (type) {
    case 'video':
      return {
        title: 'Video Consultation',
        icon: 'videocam' as const,
        instructions: 'You will receive a video call link via email 30 minutes before your appointment.',
      };
    case 'chat':
      return {
        title: 'Chat Consultation',
        icon: 'chatbubble' as const,
        instructions: 'You will receive a chat link via email 30 minutes before your appointment.',
      };
    case 'in-person':
    default:
      return {
        title: 'In-person Consultation',
        icon: 'people' as const,
        instructions: 'Please arrive at the clinic 10 minutes before your scheduled appointment.',
        location: 'Trace Expert City, Colombo 10',
      };
  }
};

export default function BookingConfirmationRoute() {
  const { id, type } = useLocalSearchParams();
  const router = useRouter();
  const consultationType = (type as ConsultationType) || 'in-person';
  const details = getConsultationDetails(consultationType);

  const bookingId = `JND${Date.now().toString().slice(-8)}`;

  const handleBackToHome = () => {
    router.push('/(tabs)/doctors');
  };

  const handleViewAppointments = () => {
    router.push('/appointments');
  };

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.white}>
      <View style={styles.header}>
        <View style={styles.backButton} />
        <Text style={styles.headerTitle}>Booking Confirmed</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>Your appointment has been booked successfully.</Text>
        </View>

        <View style={styles.bookingCard}>
          <View style={styles.bookingHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
              {consultationType === 'in-person' ? (
                <MaterialCommunityIcons name="account-group" size={24} color={COLORS.primary} />
              ) : (
                <Ionicons name={details.icon} size={24} color={COLORS.primary} />
              )}
            </View>
            <View style={styles.bookingHeaderText}>
              <Text style={styles.bookingType}>{details.title}</Text>
              <Text style={styles.bookingId}>Booking ID: {bookingId}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="person-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Doctor</Text>
                <Text style={styles.detailValue}>Dr. Sarah Johnson</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>Wed, Dec 14, 2024 at 11:00 AM</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="time-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>{consultationType === 'in-person' ? '20 minutes' : '15 minutes'}</Text>
              </View>
            </View>

            {details.location && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="location-outline" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{details.location}</Text>
                </View>
              </View>
            )}

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="cash-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Amount Paid</Text>
                <Text style={[styles.detailValue, styles.paidAmount]}>
                  ${consultationType === 'in-person' ? '52.50' : '47.50'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.instructionsCard}>
          <View style={styles.instructionsHeader}>
            <Ionicons name="information-circle" size={20} color="#2196F3" />
            <Text style={styles.instructionsTitle}>What's Next?</Text>
          </View>
          <Text style={styles.instructionsText}>{details.instructions}</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <Ionicons name="mail-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.instructionText}>Confirmation email sent to your registered email</Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="notifications-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.instructionText}>You will receive a reminder 1 hour before</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleViewAppointments}>
            <Text style={styles.primaryButtonText}>View My Appointments</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleBackToHome}>
            <Text style={styles.secondaryButtonText}>Back to Doctors</Text>
          </TouchableOpacity>
        </View>
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
    borderBottomColor: '#E8F5E9',
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#4CAF50',
    flex: 1,
    textAlign: 'center',
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
  successContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  successIcon: {
    marginBottom: SPACING.md,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: SPACING.xs,
  },
  successSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  bookingCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  bookingHeaderText: {
    flex: 1,
  },
  bookingType: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  bookingId: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  detailsSection: {
    gap: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  paidAmount: {
    color: '#4CAF50',
    fontWeight: '700',
  },
  instructionsCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  instructionsTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  instructionsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  instructionsList: {
    gap: SPACING.sm,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  instructionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  buttonContainer: {
    gap: SPACING.sm,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
