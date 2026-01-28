import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { doctorApi } from '../services/doctorApi';
import { useToast } from '../../../providers/ToastProvider';

interface AppointmentDetail {
  id: number;
  userId: number;
  doctorId: number;
  doctorName: string;
  email: string;
  date: string;
  time: string;
  specialty: string;
  type: string;
  status: string;
  fee?: number;
}

export const AppointmentDetailScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { showToast } = useToast();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetail();
    }
  }, [appointmentId]);

  const fetchAppointmentDetail = async () => {
    try {
      setLoading(true);
      const data = await doctorApi.getAppointmentById(appointmentId);
      
      // Fetch doctor details to get consultation fee
      const anyData = data as any;
      if (anyData?.doctorId) {
        try {
          const doctorData = await doctorApi.getDoctorById(String(anyData.doctorId));
          
          // Calculate fee based on appointment type
          let fee = doctorData?.consultationFee || 0;
          
          if (doctorData?.consultationFees) {
            const appointmentType = anyData.type?.toLowerCase().replace('_', '-') || 'in-person';
            const feeKeyMap: Record<string, string[]> = {
              'in-person': ['in-person', 'in_person', 'inperson', 'initial consultation'],
              'video': ['video'],
              'chat': ['chat'],
            };
            
            const possibleKeys = feeKeyMap[appointmentType] || [appointmentType];
            for (const key of possibleKeys) {
              if (doctorData.consultationFees[key] !== undefined) {
                fee = doctorData.consultationFees[key];
                break;
              }
            }
          }
          
          // Add fee to appointment data with all required properties
          const appointmentDetail: AppointmentDetail = {
            id: Number(anyData.id),
            userId: Number(anyData.userId),
            doctorId: Number(anyData.doctorId),
            doctorName: anyData.doctorName || doctorData.name || 'Unknown Doctor',
            email: anyData.email || doctorData.email || '',
            date: anyData.date,
            time: anyData.time,
            specialty: anyData.specialty || doctorData.specialty || '',
            type: anyData.type,
            status: anyData.status,
            fee
          };
          setAppointment(appointmentDetail);
        } catch (doctorError) {
          console.error('Error fetching doctor details:', doctorError);
          // Set appointment without fee if doctor fetch fails
          const appointmentDetail: AppointmentDetail = {
            id: Number(anyData.id),
            userId: Number(anyData.userId),
            doctorId: Number(anyData.doctorId),
            doctorName: anyData.doctorName || 'Unknown Doctor',
            email: anyData.email || '',
            date: anyData.date,
            time: anyData.time,
            specialty: anyData.specialty || '',
            type: anyData.type,
            status: anyData.status,
            fee: 0
          };
          setAppointment(appointmentDetail);
        }
      } else if (anyData) {
        const appointmentDetail: AppointmentDetail = {
          id: Number(anyData.id),
          userId: Number(anyData.userId),
          doctorId: Number(anyData.doctorId),
          doctorName: anyData.doctorName || 'Unknown Doctor',
          email: anyData.email || '',
          date: anyData.date,
          time: anyData.time,
          specialty: anyData.specialty || '',
          type: anyData.type,
          status: anyData.status,
          fee: 0
        };
        setAppointment(appointmentDetail);
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
      showToast('Failed to load appointment details', 'error');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      timeZone: 'Asia/Colombo',
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
      case 'confirmed':
        return { bg: '#E8F5E9', text: '#4CAF50' };
      case 'completed':
        return { bg: '#E3F2FD', text: '#2196F3' };
      case 'cancelled':
        return { bg: '#FFEBEE', text: '#F44336' };
      case 'pending':
        return { bg: '#FFF3E0', text: '#FF9800' };
      default:
        return { bg: '#F5F5F5', text: '#757575' };
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointment) return;

    try {
      setCancelling(true);
      await doctorApi.cancelAppointment(appointment.id.toString());
      showToast('Appointment cancelled successfully', 'success');
      setShowCancelModal(false);
      router.back();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      showToast('Failed to cancel appointment', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper safeArea backgroundColor={COLORS.background} edges={[]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={{ flex: 1, fontSize: 18, fontWeight: '600', textAlign: 'center', marginRight: 32 }}>Appointment Details</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, color: COLORS.textSecondary }}>Loading details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!appointment) {
    return null;
  }

  const statusColors = getStatusColor(appointment.status);
  const isUpcoming = appointment.status?.toLowerCase() === 'scheduled' || appointment.status?.toLowerCase() === 'confirmed';

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.background} edges={[]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 18, fontWeight: '600', textAlign: 'center' }}>Appointment Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Status Badge */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ backgroundColor: statusColors.bg, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: statusColors.text, textTransform: 'capitalize' }}>
              {appointment.status}
            </Text>
          </View>
        </View>

        {/* Doctor Information */}
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', marginBottom: 12 }}>Doctor Information</Text>
          
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 }}>{appointment.doctorName}</Text>
            <Text style={{ fontSize: 16, color: COLORS.primary, fontWeight: '500' }}>{appointment.specialty}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0' }}>
            <Ionicons name="mail-outline" size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>{appointment.email}</Text>
          </View>
        </View>

        {/* Appointment Details */}
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', marginBottom: 16 }}>Appointment Details</Text>
          
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 }}>Date</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary }}>{formatDate(appointment.date)}</Text>
              </View>
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 }}>Time</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary }}>{formatTime(appointment.time)}</Text>
              </View>
            </View>
          </View>

          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                <MaterialCommunityIcons 
                  name={appointment.type?.toUpperCase() === 'VIDEO' ? 'video' : appointment.type?.toUpperCase() === 'CHAT' ? 'chat' : 'hospital-building'} 
                  size={20} 
                  color={COLORS.primary} 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 }}>Consultation Type</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary }}>
                  {appointment.type?.toUpperCase() === 'VIDEO' ? 'Video Consultation' : 
                   appointment.type?.toUpperCase() === 'CHAT' ? 'Chat Consultation' : 
                   appointment.type?.toUpperCase() === 'IN_PERSON' ? 'In-Person Visit' : 
                   appointment.type || 'Consultation'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Consultation Fee */}
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', marginBottom: 16 }}>Payment Information</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <MaterialCommunityIcons name="currency-usd" size={20} color="#4CAF50" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 }}>Consultation Fee</Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#4CAF50' }}>${(appointment.fee || 0).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Cancel Button */}
        {isUpcoming && (
          <TouchableOpacity
            onPress={() => setShowCancelModal(true)}
            style={{
              backgroundColor: '#F44336',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              shadowColor: '#F44336',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="close-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>Cancel Appointment</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, maxWidth: 320, width: '100%' }}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="alert-circle" size={32} color="#F44336" />
              </View>
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 8 }}>
              Cancel Appointment?
            </Text>
            <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 }}>
              Are you sure you want to cancel your appointment with {appointment.doctorName}?
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowCancelModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#F5F5F5',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textPrimary }}>Keep It</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancelAppointment}
                disabled={cancelling}
                style={{
                  flex: 1,
                  backgroundColor: '#F44336',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                {cancelling ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Cancel</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};
