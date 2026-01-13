import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { doctorApi } from '../services/doctorApi';
import { useAuth } from '../../../providers/AuthProvider';
import { useToast } from '../../../providers/ToastProvider';

type ConsultationType = 'in-person' | 'video' | 'chat';

const PREPARATION_ITEMS: Record<ConsultationType, { text: string; required: boolean }[]> = {
  'in-person': [
    { text: 'National ID or passport', required: true },
    { text: 'Previous medical records', required: true },
    { text: 'Current prescriptions or medication list', required: true },
    { text: 'Appointment confirmation', required: true },
  ],
  'video': [
    { text: 'Stable internet connection', required: true },
    { text: 'Quiet environment', required: true },
    { text: 'Medical history documents', required: false },
  ],
  'chat': [
    { text: 'Stable internet connection', required: true },
    { text: 'Quiet environment', required: true },
    { text: 'Medical history documents', required: false },
  ],
};

const ADDITIONAL_NOTES: Record<ConsultationType, string[]> = {
  'in-person': [
    'Please arrive 10 minutes early.',
    'Rescheduling allowed up to 2 hours before.',
    'Emergency cases should visit nearest hospital.',
  ],
  'video': [],
  'chat': [],
};

export const ConfirmAppointmentScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const { id, date, time, slotId, doctorName, specialty, hospital, consultationFee, type, duration } = params;
  const consultationType = (type as ConsultationType) || 'in-person';

  const [booking, setBooking] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString('en-GB', {
      timeZone: 'Asia/Colombo',
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes?.substring(0, 2) || '00'} ${ampm}`;
  };

  const getTitle = () => {
    switch (consultationType) {
      case 'chat': return 'Chat Consultation';
      case 'video': return 'Video Consultation';
      case 'in-person': return 'In-person Consultation';
      default: return 'Consultation';
    }
  };

  const getDescription = () => {
    switch (consultationType) {
      case 'chat':
        return 'Connect with healthcare professionals through secure chats. Get medical advice, prescriptions, and follow-up care from the comfort of your home.';
      case 'video':
        return 'Connect with healthcare professionals through secure video calls. Get medical advice, prescriptions, and follow-up care from the comfort of your home.';
      case 'in-person':
        return 'Connect with your doctor for a face-to-face visit at the clinic. Receive physical examinations, direct evaluation, prescriptions, and personalized treatment plans.';
      default:
        return '';
    }
  };

  const getIcon = () => {
    switch (consultationType) {
      case 'chat': return <Ionicons name="chatbubble-ellipses" size={32} color={COLORS.primary} />;
      case 'video': return <Ionicons name="videocam" size={32} color={COLORS.primary} />;
      case 'in-person': return <MaterialCommunityIcons name="account-group" size={32} color={COLORS.primary} />;
      default: return <Ionicons name="medical" size={32} color={COLORS.primary} />;
    }
  };

  const getEmailNote = () => {
    return 'You will receive a confirmation email with your appointment details shortly.';
  };

  const handleConfirmBooking = async () => {
    if (!user?.id || !id || !date || !time) {
      console.log('Missing info:', { userId: user?.id, id, date, time });
      showToast('Missing required information', 'error');
      return;
    }

    try {
      setBooking(true);
      await doctorApi.bookAppointment({
        userId: Number(user.id),
        doctorId: id as string,
        date: date as string,
        time: time as string,
        type: consultationType,
      });

      showToast('Appointment booked successfully!', 'success');
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      showToast(error.message || 'Failed to book appointment', 'error');
    } finally {
      setBooking(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.replace('/appointments');
  };

  const preparationItems = PREPARATION_ITEMS[consultationType] || [];
  const additionalNotes = ADDITIONAL_NOTES[consultationType] || [];

  return (
    <ScreenWrapper safeArea backgroundColor="#F8F9FA">
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 18, fontWeight: '600', textAlign: 'center' }}>{getTitle()}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#F3E5F5', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            {getIcon()}
          </View>
          
          <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 }}>{getTitle()}</Text>
          <Text style={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 24 }}>{getDescription()}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3E5F5', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            </View>
            <View>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Duration</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary }}>{duration || '30'} minutes</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <MaterialCommunityIcons name="currency-usd" size={20} color="#4CAF50" />
            </View>
            <View>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Consultation Fee</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary }}>${Number(consultationFee || 0).toFixed(2)}</Text>
            </View>
          </View>

          {consultationType === 'in-person' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                <Ionicons name="location-outline" size={20} color="#2196F3" />
              </View>
              <View>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Location</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary }}>{hospital}</Text>
              </View>
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <Ionicons name="calendar-outline" size={20} color="#FF9800" />
            </View>
            <View>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Date & Time</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary }}>{formatDate(date as string)}, {formatTime(time as string)}</Text>
            </View>
          </View>
        </View>

        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="clipboard-outline" size={20} color={COLORS.textPrimary} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary }}>What you need to prepare</Text>
          </View>
          
          {preparationItems.map((item, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: item.required ? COLORS.primary : '#E0E0E0',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}>
                <Ionicons name="checkmark" size={14} color="#fff" />
              </View>
              <Text style={{ fontSize: 14, color: COLORS.textPrimary, flex: 1 }}>
                {item.text}
                {!item.required && <Text style={{ color: COLORS.textSecondary }}> (optional)</Text>}
              </Text>
            </View>
          ))}
        </View>

        {additionalNotes.length > 0 && (
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                <Ionicons name="information-circle" size={20} color="#F44336" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary }}>Additional Notes</Text>
            </View>
            
            {additionalNotes.map((note, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#9E9E9E', marginTop: 6, marginRight: 10 }} />
                <Text style={{ fontSize: 14, color: COLORS.textSecondary, flex: 1 }}>{note}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ backgroundColor: '#E3F2FD', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 }}>
          <Ionicons name="mail-outline" size={20} color="#1976D2" style={{ marginRight: 12, marginTop: 2 }} />
          <Text style={{ fontSize: 14, color: '#1976D2', flex: 1, lineHeight: 20 }}>{getEmailNote()}</Text>
        </View>
      </ScrollView>

      <View style={{ padding: 16, backgroundColor: '#fff' }}>
        <TouchableOpacity
          onPress={handleConfirmBooking}
          disabled={booking}
          style={{
            backgroundColor: COLORS.primary,
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          {booking ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>Confirm Appointment</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessClose}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 30, alignItems: 'center', maxWidth: 320, width: '100%' }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
              <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10, textAlign: 'center' }}>
              Appointment Confirmed!
            </Text>
            <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
              Your {getTitle().toLowerCase()} with {doctorName} has been successfully booked for {formatDate(date as string)} at {formatTime(time as string)}.
            </Text>
            <TouchableOpacity
              onPress={handleSuccessClose}
              style={{
                backgroundColor: COLORS.primary,
                paddingVertical: 14,
                paddingHorizontal: 40,
                borderRadius: 10,
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>View My Appointments</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};
