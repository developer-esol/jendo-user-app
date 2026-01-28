import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { doctorApi } from '../services/doctorApi';
import { useAuth } from '../../../providers/AuthProvider';
import { useToast } from '../../../providers/ToastProvider';

interface AppointmentData {
  id: number;
  userId: number;
  doctorId: number;
  doctorName: string;
  email: string;
  date: string;
  time: string;
  specialty: string;
  qualifications: string;
  type: string;
  status: string;
  fee?: number;
}

export const MyAppointmentsScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [user?.id])
  );

  const fetchAppointments = async (isRefresh = false) => {
    if (!user?.id) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await doctorApi.getUserAppointments(user.id);
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      showToast('Failed to load appointments', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      timeZone: 'Asia/Colombo',
      weekday: 'short',
      day: '2-digit',
      month: 'short',
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

  const renderAppointment = ({ item }: { item: AppointmentData }) => {
    const statusColors = getStatusColor(item.status);

    return (
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary }}>{item.doctorName}</Text>
            <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginTop: 2 }}>{item.specialty}</Text>
          </View>
          <View style={{ backgroundColor: statusColors.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: statusColors.text, textTransform: 'capitalize' }}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>{formatDate(item.date)}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>{formatTime(item.time)}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <MaterialCommunityIcons 
            name={item.type?.toUpperCase() === 'VIDEO' ? 'video' : item.type?.toUpperCase() === 'CHAT' ? 'chat' : 'hospital-building'} 
            size={16} 
            color={COLORS.textSecondary} 
            style={{ marginRight: 8 }} 
          />
          <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>
            {item.type?.toUpperCase() === 'VIDEO' ? 'Video Consultation' : 
             item.type?.toUpperCase() === 'CHAT' ? 'Chat Consultation' : 
             item.type?.toUpperCase() === 'IN_PERSON' ? 'In-Person Visit' : 
             item.type || 'Consultation'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push(`/appointments/${item.id}` as any)}
          style={{
            backgroundColor: COLORS.primary,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="eye-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>View Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper safeArea backgroundColor={COLORS.background}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={{ flex: 1, fontSize: 18, fontWeight: '600', textAlign: 'center', marginRight: 32 }}>My Appointments</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, color: COLORS.textSecondary }}>Loading appointments...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.background}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 18, fontWeight: '600', textAlign: 'center' }}>My Appointments</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAppointments(true)}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={() => (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="calendar-outline" size={40} color={COLORS.textSecondary} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 }}>No Appointments</Text>
            <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 20 }}>
              You haven't booked any appointments yet.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/doctors')}
              style={{
                backgroundColor: COLORS.primary,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Find a Doctor</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </ScreenWrapper>
  );
};
