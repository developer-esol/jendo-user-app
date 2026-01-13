import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { doctorApi } from '../services/doctorApi';
import { Doctor } from '../../../types/models';
import { useAuth } from '../../../providers/AuthProvider';
import { useToast } from '../../../providers/ToastProvider';

interface AvailableSlot {
  id: number;
  doctorId: number;
  slotDate: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  slotDurationMinutes: number;
}

type ConsultationType = 'in-person' | 'video' | 'chat';

const CONSULTATION_TYPES: { key: ConsultationType; label: string; subtitle: string; icon: any; iconName: string }[] = [
  { key: 'in-person', label: 'In-person', subtitle: 'Visit clinic', icon: MaterialCommunityIcons, iconName: 'account-group' },
  { key: 'video', label: 'Video', subtitle: 'Online consultation', icon: Ionicons, iconName: 'videocam' },
  { key: 'chat', label: 'Chat', subtitle: 'Text consultation', icon: Ionicons, iconName: 'chatbubble-ellipses' },
];

export const BookAppointmentScreen: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.push('/doctors');
    }
  };

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [consultationType, setConsultationType] = useState<ConsultationType>('video');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const availableDates = generateDates();

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchDoctorDetails();
    }
  }, [id]);

  useEffect(() => {
    if (selectedDate && id) {
      fetchAvailableSlots();
    }
  }, [selectedDate, id]);

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      const data = await doctorApi.getDoctorById(id as string);
      setDoctor(data);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      showToast('Failed to load doctor details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDate) return;
    try {
      setLoadingSlots(true);
      const slots = await doctorApi.getAvailableSlots(id as string, selectedDate);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return {
      weekday: date.toLocaleDateString('en-GB', { timeZone: 'Asia/Colombo', weekday: 'short' }),
      day: date.getDate(),
    };
  };

  const formatDateLong = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      timeZone: 'Asia/Colombo',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getConsultationFee = () => {
    if (!doctor) return 0;
    const fees = doctor.consultationFees as Record<string, number> | undefined;
    if (fees) {
      const feeKeyMap: Record<string, string[]> = {
        'in-person': ['in-person', 'in_person', 'inperson'],
        'video': ['video'],
        'chat': ['chat'],
      };
      const possibleKeys = feeKeyMap[consultationType] || [consultationType];
      for (const key of possibleKeys) {
        if (fees[key] !== undefined) {
          return fees[key];
        }
      }
    }
    return doctor.consultationFee || 0;
  };

  const getDurationMinutes = () => {
    switch (consultationType) {
      case 'chat': return 15;
      case 'video': return 15;
      case 'in-person': return 20;
      default: return 30;
    }
  };

  const getConsultationLabel = () => {
    switch (consultationType) {
      case 'chat': return 'Chat Consultation';
      case 'video': return 'Video Consultation';
      case 'in-person': return 'In-person Consultation';
      default: return 'Consultation';
    }
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime || !doctor) {
      showToast('Please select a date and time', 'error');
      return;
    }
    router.push({
      pathname: `/doctors/${id}/confirm`,
      params: {
        date: selectedDate,
        time: selectedTime,
        slotId: selectedSlotId?.toString() || '',
        doctorName: doctor.name,
        specialty: doctor.specialty,
        hospital: doctor.hospital,
        consultationFee: getConsultationFee().toString(),
        type: consultationType,
        duration: getDurationMinutes().toString(),
      },
    } as any);
  };

  if (loading) {
    return (
      <ScreenWrapper safeArea backgroundColor={COLORS.white}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' }}>
          <TouchableOpacity onPress={handleBack} style={{ padding: 8 }}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={{ flex: 1, fontSize: 18, fontWeight: '600', textAlign: 'center', marginRight: 32 }}>Book Appointment</Text>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="notifications" size={18} color="#fff" />
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper safeArea backgroundColor="#F8F9FA">
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' }}>
        <TouchableOpacity onPress={handleBack} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 18, fontWeight: '600', textAlign: 'center' }}>Book Appointment</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12 }}>Consultation Type</Text>
        
        <View style={{ marginBottom: 24 }}>
          {CONSULTATION_TYPES.map((type) => {
            const IconComponent = type.icon;
            const isSelected = consultationType === type.key;
            return (
              <TouchableOpacity
                key={type.key}
                onPress={() => setConsultationType(type.key)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 10,
                  borderWidth: 2,
                  borderColor: isSelected ? COLORS.primary : '#E0E0E0',
                }}
              >
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: isSelected ? '#F3E5F5' : '#F5F5F5',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}>
                  <IconComponent name={type.iconName} size={22} color={isSelected ? COLORS.primary : '#666'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary }}>{type.label}</Text>
                  <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>{type.subtitle}</Text>
                </View>
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: isSelected ? COLORS.primary : '#CCC',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  {isSelected && (
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary }} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12 }}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          {availableDates.map((date) => {
            const { weekday, day } = formatDateShort(date);
            const isSelected = selectedDate === date;
            return (
              <TouchableOpacity
                key={date}
                onPress={() => {
                  setSelectedDate(date);
                  setSelectedTime(null);
                  setSelectedSlotId(null);
                }}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  marginRight: 10,
                  minWidth: 60,
                  alignItems: 'center',
                  backgroundColor: isSelected ? COLORS.primary : '#fff',
                  borderWidth: 1,
                  borderColor: isSelected ? COLORS.primary : '#E0E0E0',
                }}
              >
                <Text style={{ fontSize: 12, color: isSelected ? '#fff' : COLORS.textSecondary, marginBottom: 4 }}>
                  {weekday}
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '700', color: isSelected ? '#fff' : COLORS.textPrimary }}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {selectedDate && (
          <>
            <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12 }}>Available Times</Text>
            {loadingSlots ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={{ marginTop: 8, color: COLORS.textSecondary }}>Loading available times...</Text>
              </View>
            ) : availableSlots.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                {availableSlots.map((slot) => {
                  const isSelected = selectedTime === slot.startTime;
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      onPress={() => {
                        setSelectedTime(slot.startTime);
                        setSelectedSlotId(slot.id);
                      }}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        backgroundColor: isSelected ? COLORS.primary : '#fff',
                        borderWidth: 1,
                        borderColor: isSelected ? COLORS.primary : '#E0E0E0',
                        minWidth: 85,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '500', color: isSelected ? '#fff' : COLORS.textPrimary }}>
                        {formatTime(slot.startTime)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={{ padding: 40, alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, marginBottom: 24 }}>
                <Ionicons name="calendar-outline" size={48} color="#FF9800" />
                <Text style={{ marginTop: 12, color: '#E65100', textAlign: 'center', fontSize: 14 }}>
                  No available slots for this date.{'\n'}Please select another date.
                </Text>
              </View>
            )}
          </>
        )}

        {selectedDate && selectedTime && (
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 }}>Appointment Summary</Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>Date</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textPrimary }}>{formatDateLong(selectedDate)}</Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>Time</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textPrimary }}>{formatTime(selectedTime)}</Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>Type</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textPrimary }}>{getConsultationLabel()}</Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>Duration</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textPrimary }}>{getDurationMinutes()} minutes</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={{ padding: 16, backgroundColor: '#fff' }}>
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!selectedDate || !selectedTime}
          style={{
            backgroundColor: selectedDate && selectedTime ? COLORS.primary : '#E0E0E0',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: selectedDate && selectedTime ? '#fff' : '#999' }}>
            Continue to Booking
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};
