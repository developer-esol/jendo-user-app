import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { doctorsStyles as styles } from '../components';
import { doctorApi } from '../services/doctorApi';
import { DoctorSummary } from '../../../types/models';

const SPECIALTIES = [
  { key: 'all', label: 'All Doctors' },
  { key: 'cardiologist', label: 'Cardiology' },
  { key: 'neurologist', label: 'Neurology' },
  { key: 'dermatologist', label: 'Dermatology' },
];

export const DoctorsScreen: React.FC = () => {
  const router = useRouter();
  const [activeSpecialty, setActiveSpecialty] = useState<string>('all');
  const [doctors, setDoctors] = useState<DoctorSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch doctors from API
  const fetchDoctors = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await doctorApi.getAllDoctors(0, 20); // Fetch first 20 doctors
      setDoctors(result.doctors);
    } catch (err) {
      console.error('Error loading doctors:', err);
      setError('Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load doctors on mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Filter doctors by specialty
  const filteredDoctors = activeSpecialty === 'all' 
    ? doctors 
    : doctors.filter(doc => 
        doc.specialty.toLowerCase() === activeSpecialty.toLowerCase()
      );

  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(part => part.length > 0);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const renderDoctor = ({ item }: { item: DoctorSummary }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => router.push(`/doctors/${item.id}`)}
      activeOpacity={0.7}
    >
      {item.imageUrl ? (
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.doctorImage}
        />
      ) : (
        <View style={{ 
          width: 70, 
          height: 70, 
          borderRadius: 12, 
          backgroundColor: '#8B5CF6',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ 
            color: '#FFFFFF', 
            fontSize: 24, 
            fontWeight: '700' 
          }}>
            {getInitials(item.name)}
          </Text>
        </View>
      )}
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{item.name}</Text>
        <Text style={styles.specialty}>
          {item.specialty.charAt(0).toUpperCase() + item.specialty.slice(1)}
        </Text>
        <View style={styles.experienceRow}>
          <FontAwesome5 name="hospital" size={12} color={COLORS.textSecondary} />
          <Text style={styles.experienceText}>{item.hospital}</Text>
        </View>
        <View style={styles.experienceRow}>
          <Ionicons 
            name={item.isAvailable ? 'checkmark-circle' : 'close-circle'} 
            size={12} 
            color={item.isAvailable ? '#4CAF50' : '#FF5252'} 
          />
          <Text style={[styles.experienceText, { color: item.isAvailable ? '#4CAF50' : '#FF5252' }]}>
            {item.isAvailable ? 'Available' : 'Not Available'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Show loading state
  if (loading) {
    return (
      <ScreenWrapper safeArea padded={false} backgroundColor={COLORS.white}>
        <View style={styles.header}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="finger-print" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.headerTitle}>Our Doctors</Text>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: COLORS.textSecondary }}>Loading doctors...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Show error state
  if (error) {
    return (
      <ScreenWrapper safeArea padded={false} backgroundColor={COLORS.white}>
        <View style={styles.header}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="finger-print" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.headerTitle}>Our Doctors</Text>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications" size={24} color={COLORS.primary} />

          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle" size={48} color="#FF5252" />
          <Text style={{ marginTop: 10, color: COLORS.textSecondary, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity
            style={{ marginTop: 20, backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
            onPress={() => fetchDoctors()}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper safeArea padded={false} backgroundColor={COLORS.white}>
      <View style={styles.header}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="finger-print" size={24} color={COLORS.primary} />
        </View>
        <Text style={styles.headerTitle}>Our Doctors</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => router.push('/notifications')}
        >
          <Ionicons name="notifications" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.appointmentsButton}
        onPress={() => router.push('/appointments')}
      >
        <Ionicons name="calendar" size={20} color={COLORS.primary} />
        <Text style={styles.appointmentsButtonText}>View My Appointments</Text>
      </TouchableOpacity>

      <View style={styles.filtersContainer}>
        {SPECIALTIES.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.filterChip, activeSpecialty === item.key && styles.filterChipActive]}
            onPress={() => setActiveSpecialty(item.key)}
          >
            <Text style={[styles.filterText, activeSpecialty === item.key && styles.filterTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredDoctors}
        renderItem={renderDoctor}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchDoctors(true)}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={() => (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="people-outline" size={48} color={COLORS.textSecondary} />
            <Text style={{ marginTop: 10, color: COLORS.textSecondary, textAlign: 'center' }}>
              No doctors found for this specialty
            </Text>
          </View>
        )}
      />
    </ScreenWrapper>
  );
};
