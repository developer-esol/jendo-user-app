import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { medicalRecordsStyles as styles } from '../components';

const DIABETES_SUBCATEGORIES = [
  {
    id: 'core-informations',
    name: 'Core Informations',
    count: 3,
    icon: 'clipboard-text-outline',
    iconType: 'material-community',
    bgColor: '#E8F5E9',
    iconColor: '#2E7D32',
  },
  {
    id: 'core-investigations',
    name: 'Core Investigations',
    count: 5,
    icon: 'flask-outline',
    iconType: 'ionicons',
    bgColor: '#E8F5E9',
    iconColor: '#4CAF50',
  },
  {
    id: 'treatment-medications',
    name: 'Treatment / Medications',
    count: 2,
    icon: 'medical-outline',
    iconType: 'ionicons',
    bgColor: '#F3E5F5',
    iconColor: '#9C27B0',
  },
  {
    id: 'self-management',
    name: 'Self-management / Lifestyle',
    count: 4,
    icon: 'heart',
    iconType: 'ionicons',
    bgColor: '#FFF3E0',
    iconColor: '#FF9800',
  },
  {
    id: 'urgent-items',
    name: 'Urgent / Red-flag items',
    count: 1,
    icon: 'warning-outline',
    iconType: 'ionicons',
    bgColor: '#FFEBEE',
    iconColor: '#F44336',
  },
];

export const DiabetesSectionScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const getCategoryTitle = () => {
    switch (id) {
      case 'diabetes':
        return 'Diabetes';
      case 'cardiovascular':
        return 'Cardiovascular';
      case 'pregnancy':
        return 'Pregnancy';
      case 'blood-tests':
        return 'Blood Tests';
      case 'radiology':
        return 'Radiology';
      case 'dermatology':
        return 'Dermatology';
      case 'neurology':
        return 'Neurology';
      default:
        return 'Reports';
    }
  };

  const handleSubcategoryPress = (subcategoryId: string) => {
    router.push(`/my-reports/${id}/${subcategoryId}` as any);
  };

  const renderIcon = (subcategory: typeof DIABETES_SUBCATEGORIES[0]) => {
    const iconSize = 24;
    if (subcategory.iconType === 'material-community') {
      return <MaterialCommunityIcons name={subcategory.icon as any} size={iconSize} color={subcategory.iconColor} />;
    }
    return <Ionicons name={subcategory.icon as any} size={iconSize} color={subcategory.iconColor} />;
  };

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.background}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getCategoryTitle()}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {DIABETES_SUBCATEGORIES.map(subcategory => (
          <TouchableOpacity
            key={subcategory.id}
            style={[styles.subcategoryCard, { backgroundColor: subcategory.bgColor }]}
            onPress={() => handleSubcategoryPress(subcategory.id)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainerWhite}>
              {renderIcon(subcategory)}
            </View>
            <View style={styles.subcategoryInfo}>
              <Text style={styles.subcategoryName}>{subcategory.name}</Text>
              <Text style={styles.subcategoryCount}>
                {subcategory.count} {subcategory.count === 1 ? 'report' : 'reports'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
};
