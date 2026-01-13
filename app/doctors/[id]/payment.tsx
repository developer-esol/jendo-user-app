import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../src/common/components/layout';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../../src/config/theme.config';

type PaymentMethod = 'card' | 'paypal' | 'apple';

const getConsultationFee = (type: string) => {
  switch (type) {
    case 'video':
    case 'chat':
      return { fee: 45.00, label: '$45.00' };
    case 'in-person':
    default:
      return { fee: 50.00, label: '$50.00' };
  }
};

export default function PaymentGatewayRoute() {
  const { id, type } = useLocalSearchParams();
  const router = useRouter();
  const consultationType = (type as string) || 'in-person';
  const { fee, label } = getConsultationFee(consultationType);
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const serviceFee = 2.50;
  const totalAmount = fee + serviceFee;

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      router.push(`/doctors/${id}/confirmation?type=${consultationType}` as any);
    }, 2000);
  };

  const isFormValid = cardNumber.length >= 19 && expiryDate.length >= 5 && cvv.length >= 3 && cardHolder.length > 0;

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.white}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.orderSummary}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {consultationType === 'in-person' ? 'In-person' : consultationType === 'video' ? 'Video' : 'Chat'} Consultation
            </Text>
            <Text style={styles.summaryValue}>{label}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee</Text>
            <Text style={styles.summaryValue}>${serviceFee.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Payment Method</Text>
        
        <View style={styles.paymentMethods}>
          <TouchableOpacity 
            style={[styles.methodCard, paymentMethod === 'card' && styles.methodCardActive]}
            onPress={() => setPaymentMethod('card')}
          >
            <View style={[styles.methodIcon, { backgroundColor: paymentMethod === 'card' ? '#F3E5F5' : '#F5F5F5' }]}>
              <Ionicons name="card" size={20} color={paymentMethod === 'card' ? COLORS.primary : COLORS.textSecondary} />
            </View>
            <Text style={styles.methodText}>Credit Card</Text>
            <View style={[styles.radioOuter, paymentMethod === 'card' && styles.radioOuterActive]}>
              {paymentMethod === 'card' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.methodCard, paymentMethod === 'paypal' && styles.methodCardActive]}
            onPress={() => setPaymentMethod('paypal')}
          >
            <View style={[styles.methodIcon, { backgroundColor: paymentMethod === 'paypal' ? '#E3F2FD' : '#F5F5F5' }]}>
              <Ionicons name="logo-paypal" size={20} color={paymentMethod === 'paypal' ? '#003087' : COLORS.textSecondary} />
            </View>
            <Text style={styles.methodText}>PayPal</Text>
            <View style={[styles.radioOuter, paymentMethod === 'paypal' && styles.radioOuterActive]}>
              {paymentMethod === 'paypal' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.methodCard, paymentMethod === 'apple' && styles.methodCardActive]}
            onPress={() => setPaymentMethod('apple')}
          >
            <View style={[styles.methodIcon, { backgroundColor: paymentMethod === 'apple' ? '#F5F5F5' : '#F5F5F5' }]}>
              <Ionicons name="logo-apple" size={20} color={paymentMethod === 'apple' ? '#000' : COLORS.textSecondary} />
            </View>
            <Text style={styles.methodText}>Apple Pay</Text>
            <View style={[styles.radioOuter, paymentMethod === 'apple' && styles.radioOuterActive]}>
              {paymentMethod === 'apple' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        </View>

        {paymentMethod === 'card' && (
          <View style={styles.cardForm}>
            <Text style={styles.sectionTitle}>Card Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={COLORS.textMuted}
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="numeric"
                  maxLength={19}
                />
                <View style={styles.cardIcons}>
                  <MaterialCommunityIcons name="credit-card" size={20} color={COLORS.textSecondary} />
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor={COLORS.textMuted}
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={{ width: SPACING.md }} />
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor={COLORS.textMuted}
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={COLORS.textMuted}
                value={cardHolder}
                onChangeText={setCardHolder}
                autoCapitalize="words"
              />
            </View>
          </View>
        )}

        <View style={styles.secureNotice}>
          <Ionicons name="lock-closed" size={16} color="#4CAF50" />
          <Text style={styles.secureText}>Your payment information is secure and encrypted</Text>
        </View>

        <TouchableOpacity 
          style={[
            styles.payButton, 
            (!isFormValid && paymentMethod === 'card') && styles.payButtonDisabled,
            isProcessing && styles.payButtonProcessing
          ]}
          onPress={handlePayment}
          disabled={(!isFormValid && paymentMethod === 'card') || isProcessing}
        >
          {isProcessing ? (
            <Text style={styles.payButtonText}>Processing...</Text>
          ) : (
            <Text style={styles.payButtonText}>Pay ${totalAmount.toFixed(2)}</Text>
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
  orderSummary: {
    backgroundColor: '#F7F7F9',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  paymentMethods: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
  },
  methodCardActive: {
    borderColor: COLORS.primary,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  methodText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  cardForm: {
    marginBottom: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F7F7F9',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardIcons: {
    position: 'absolute',
    right: SPACING.md,
  },
  row: {
    flexDirection: 'row',
  },
  secureNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  secureText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#4CAF50',
    flex: 1,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  payButtonProcessing: {
    backgroundColor: COLORS.primary,
    opacity: 0.8,
  },
  payButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});
