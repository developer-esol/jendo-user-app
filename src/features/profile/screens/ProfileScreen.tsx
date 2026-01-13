import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { API_CONFIG } from '../../../config/api.config';
import { profileStyles as styles } from '../components';
import { useAuth } from '../../../providers/AuthProvider';
import { useUserStore } from '../../../state/userSlice';
import { profileApi } from '../services/profileApi';

const calculateBMI = (weight?: number, height?: number): { value: string; category: string; color: string } => {
  if (!weight || !height || height === 0) {
    return { value: '--', category: 'Not calculated', color: '#9E9E9E' };
  }
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  const bmiValue = bmi.toFixed(1);
  
  if (bmi < 18.5) {
    return { value: bmiValue, category: 'Underweight', color: '#FF9800' };
  } else if (bmi < 25) {
    return { value: bmiValue, category: 'Normal', color: '#4CAF50' };
  } else if (bmi < 30) {
    return { value: bmiValue, category: 'Overweight', color: '#FF9800' };
  } else {
    return { value: bmiValue, category: 'Obese', color: '#F44336' };
  }
};

export const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const { user, updateUser } = useUserStore();
  const [uploadingImage, setUploadingImage] = useState(false);

  const userName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User' : 'User';
  const userEmail = user?.email || '';
  
  // Construct full image URL if it's a relative path from backend
  const rawAvatar = user?.avatar || user?.profileImage;
  
  console.log('=== AVATAR DEBUG ===');
  console.log('user:', JSON.stringify(user, null, 2));
  console.log('rawAvatar:', rawAvatar);
  console.log('BASE_URL:', API_CONFIG.BASE_URL);
  
  const userAvatar = rawAvatar?.startsWith('/uploads/') 
    ? `${API_CONFIG.BASE_URL.replace('/api', '')}${rawAvatar}`
    : rawAvatar;
  
  console.log('userAvatar:', userAvatar);
  console.log('==================');
  
  const defaultAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName) + '&background=7B2D8E&color=fff&size=200';

  const bmiData = calculateBMI(user?.weight, user?.height);

  const handleSelectProfileImage = async () => {
    console.log('Camera button clicked!');
    try {
      // Show options: Take Photo or Choose from Library
      Alert.alert(
        'Profile Photo',
        'Choose an option',
        [
          {
            text: 'Take Photo',
            onPress: handleTakePhoto,
          },
          {
            text: 'Choose from Library',
            onPress: handlePickImage,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error: any) {
      console.error('Error showing picker options:', error);
      Alert.alert('Error', 'Failed to show options: ' + (error?.message || 'Unknown error'));
    }
  };

  const handleTakePhoto = async () => {
    console.log('Launching camera...');
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      console.log('Camera permission result:', cameraPermission);
      
      if (!cameraPermission.granted) {
        Alert.alert('Permission Required', 'Please allow camera access to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3, // Lower quality for smaller file size (under 1MB)
      });

      console.log('Camera result:', result);

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error: any) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo: ' + (error?.message || 'Unknown error'));
    }
  };

  const handlePickImage = async () => {
    console.log('Launching image picker...');
    try {
      // Request permission first
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission result:', permissionResult);
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3, // Lower quality for smaller file size (under 1MB)
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image: ' + (error?.message || 'Unknown error'));
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    try {
      setUploadingImage(true);
      
      // Check file size (this won't work for all URIs, but helps for debugging)
      console.log('Uploading image from:', imageUri);
      
      const response = await profileApi.uploadProfileImage(imageUri);
      
      // Update entire user object to prevent losing other fields
      // Response is wrapped in ApiResponse, actual user data is in response.data
      if (response?.data) {
        updateUser(response.data);
      }
      
      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      console.error('Error response:', error?.response?.data);
      
      if (error?.response?.status === 413) {
        Alert.alert(
          'File Too Large', 
          'The image is too large. Please try a different photo or contact support if this persists.'
        );
      } else if (error?.response?.status === 500) {
        const errorMessage = error?.response?.data?.message || error?.response?.data?.error || 'Server error occurred';
        Alert.alert('Server Error', `Failed to upload: ${errorMessage}\n\nThe server may need to be updated with the latest code.`);
      } else {
        Alert.alert('Error', 'Failed to upload profile photo: ' + (error?.message || 'Unknown error'));
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('jwtToken');
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <ScreenWrapper safeArea padded={false} backgroundColor={COLORS.white}>
      <View style={styles.header}>
        <Image source={{ uri: userAvatar || defaultAvatar }} style={styles.avatar} />
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => router.push('/notifications')}
        >
          <Ionicons name="notifications" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: userAvatar || defaultAvatar }} style={styles.profileAvatar} />
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={handleSelectProfileImage}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Ionicons name="camera" size={14} color={COLORS.white} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.membershipType}>Member</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>

        <View style={styles.menuSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={18} color={COLORS.textPrimary} />
            <Text style={styles.sectionTitle}>Personal Details</Text>
          </View>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profile/personal')}
          >
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="account-edit" size={20} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Change Details</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={18} color={COLORS.textPrimary} />
            <Text style={styles.sectionTitle}>Appointments</Text>
          </View>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/appointments')}
          >
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="calendar-check" size={20} color={COLORS.primary} />
              <Text style={styles.menuItemText}>My Appointments</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed" size={18} color={COLORS.textPrimary} />
            <Text style={styles.sectionTitle}>Security</Text>
          </View>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profile/password')}
          >
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="key-variant" size={20} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="heart-pulse" size={18} color={COLORS.textPrimary} />
            <Text style={styles.sectionTitle}>Health Parameters</Text>
          </View>
          <View style={styles.healthParamsContainer}>
            <View style={styles.healthParamCard}>
              <View style={[styles.healthParamIcon, { backgroundColor: '#FCE4EC' }]}>
                <MaterialCommunityIcons name="human-male-height" size={20} color="#E91E63" />
              </View>
              <Text style={styles.healthParamLabel}>Height</Text>
              <Text style={styles.healthParamValue}>
                {user?.height ? `${user.height}` : '--'}
              </Text>
              <Text style={styles.healthParamMetric}>
                {user?.height ? 'cm' : 'Not set'}
              </Text>
            </View>
            <View style={styles.healthParamCard}>
              <View style={[styles.healthParamIcon, { backgroundColor: '#F3E5F5' }]}>
                <MaterialCommunityIcons name="scale-bathroom" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.healthParamLabel}>Weight</Text>
              <Text style={styles.healthParamValue}>
                {user?.weight ? `${user.weight}` : '--'}
              </Text>
              <Text style={styles.healthParamMetric}>
                {user?.weight ? 'kg' : 'Not set'}
              </Text>
            </View>
            <View style={styles.healthParamCard}>
              <View style={[styles.healthParamIcon, { backgroundColor: '#E8F5E9' }]}>
                <MaterialCommunityIcons name="chart-donut" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.healthParamLabel}>BMI</Text>
              <Text style={styles.healthParamValue}>{bmiData.value}</Text>
              <Text style={[styles.healthParamStatus, { color: bmiData.color }]}>{bmiData.category}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.primary} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </ScreenWrapper>
  );
};
