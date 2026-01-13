import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { doctorsStyles as styles } from '../components';
import { doctorApi } from '../services/doctorApi';
import { Doctor } from '../../../types/models';

export const DoctorDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('DoctorDetailScreen mounted with ID:', id);
    if (id && typeof id === 'string') {
      fetchDoctorDetails();
    } else {
      console.error('Invalid doctor ID:', id);
      setError('Invalid doctor ID');
      setLoading(false);
    }
  }, [id]);

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('=== Fetching doctor with ID:', id);
      const data = await doctorApi.getDoctorById(id as string);
      console.log('=== Received doctor data:', JSON.stringify(data, null, 2));
      
      if (data) {
        console.log('=== Setting doctor state with data');
        setDoctor(data);
      } else {
        console.log('=== No doctor data returned');
        setError('Doctor not found');
        Alert.alert('Error', 'Doctor not found');
        setTimeout(() => router.back(), 1000);
      }
    } catch (error: any) {
      console.error('=== Error fetching doctor details:', error);
      console.error('=== Error message:', error.message);
      setError(error.message || 'Failed to load doctor details');
      Alert.alert('Error', 'Failed to load doctor details. Please check your connection.');
    } finally {
      console.log('=== Fetch complete, setting loading to false');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper safeArea backgroundColor={COLORS.white}>
        <View style={styles.headerWithBorder}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Doctor Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: COLORS.textMuted }}>Loading doctor details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!doctor) {
    return (
      <ScreenWrapper safeArea backgroundColor={COLORS.white}>
        <View style={styles.headerWithBorder}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Doctor Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.textMuted }}>Doctor not found</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.white}>
      <View style={styles.headerWithBorder}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.doctorCardLarge}>
          <Image 
            source={{ 
              uri: doctor.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&size=200&background=8B5CF6&color=ffffff&bold=true&format=png`
            }} 
            style={styles.doctorImageLarge} 
          />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorNameLarge}>{doctor.name}</Text>
            <Text style={styles.specialtyMd}>{doctor.specialty}</Text>
            <Text style={styles.experience}>
              {doctor.experience ? `${doctor.experience} years experience` : 'Experienced professional'}
            </Text>
          </View>
        </View>

        {/* About Section */}
        {doctor.about && (
          <>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.bioCard}>
              <Text style={styles.bioText}>{doctor.about}</Text>
            </View>
          </>
        )}

        {/* Hospital Information */}
        {doctor.hospital && (
          <>
            <Text style={styles.sectionTitle}>Hospital</Text>
            <View style={styles.optionCard}>
              <View style={[styles.optionIcon, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="business" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{doctor.hospital}</Text>
                <Text style={styles.optionDescription}>Medical facility</Text>
              </View>
            </View>
          </>
        )}

        {/* Contact Information */}
        {(doctor.phone || doctor.email) && (
          <>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            {doctor.phone && (
              <TouchableOpacity style={styles.optionCard}>
                <View style={[styles.optionIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="call" size={24} color="#4CAF50" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Phone</Text>
                  <Text style={styles.optionDescription}>{doctor.phone}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
            
            {doctor.email && (
              <TouchableOpacity style={styles.optionCard}>
                <View style={[styles.optionIcon, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="mail" size={24} color="#FF9800" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Email</Text>
                  <Text style={styles.optionDescription}>{doctor.email}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Qualifications */}
        {doctor.qualifications && doctor.qualifications.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Qualifications</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              {doctor.qualifications.map((qual, index) => (
                <View key={index} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#F8F9FA',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                }}>
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 14, color: '#333333', fontWeight: '600' }}>
                    {qual}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Available Days */}
        {doctor.availableDays && doctor.availableDays.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Available Days</Text>
            <View style={styles.optionCard}>
              <View style={[styles.optionIcon, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="calendar" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Schedule</Text>
                <Text style={styles.optionDescription}>
                  {doctor.availableDays.join(', ')}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Consultation Fee */}
        {doctor.consultationFee > 0 && (
          <>
            <Text style={styles.sectionTitle}>Consultation Fee</Text>
            <View style={styles.optionCard}>
              <View style={[styles.optionIcon, { backgroundColor: '#F3E5F5' }]}>
                <MaterialCommunityIcons name="cash" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Standard Consultation</Text>
                <Text style={[styles.optionDescription, { fontSize: 18, fontWeight: '700', color: COLORS.primary }]}>
                  ${doctor.consultationFee}
                </Text>
              </View>
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Consultation Options</Text>

        <TouchableOpacity 
          style={styles.optionCard}
          onPress={() => router.push(`/doctors/${id}/book?type=app`)}
        >
          <View style={[styles.optionIcon, { backgroundColor: '#F3E5F5' }]}>
            <MaterialCommunityIcons name="calendar-check" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Book Through App</Text>
            <Text style={styles.optionDescription}>Schedule directly inside Jendo</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.optionCard}
          onPress={() => {}}
        >
          <View style={[styles.optionIcon, { backgroundColor: '#F3E5F5' }]}>
            <MaterialCommunityIcons name="open-in-new" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Book via Partner App</Text>
            <Text style={styles.optionDescription}>Redirect to our partner platform</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
};
