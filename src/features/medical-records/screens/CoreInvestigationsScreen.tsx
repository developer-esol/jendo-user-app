import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { medicalRecordsStyles as styles } from '../components';

const CORE_INVESTIGATIONS = [
  { id: 'hba1c', name: 'HbA1c' },
  { id: 'fasting-plasma-glucose', name: 'Fasting Plasma Glucose' },
  { id: 'serum-creatinine', name: 'Serum Creatinine → eGFR' },
  { id: 'electrolytes', name: 'Electrolytes' },
  { id: 'urine-albumin', name: 'Urine Albumin-to-Creatinine Ratio (uACR)' },
  { id: 'lipid-profile', name: 'Lipid Profile' },
  { id: 'liver-function', name: 'Liver Function Tests (ALT / AST)' },
  { id: 'tsh', name: 'TSH' },
  { id: 'foot-exam', name: 'Foot Exam' },
  { id: 'retinal-exam', name: 'Retinal Exam' },
  { id: 'ascvd-risk', name: 'ASCVD Cardiovascular Risk' },
];

export const CoreInvestigationsScreen: React.FC = () => {
  const router = useRouter();
  const { id, subcategoryId } = useLocalSearchParams();

  const getTitle = () => {
    switch (subcategoryId) {
      case 'core-investigations':
        return 'Core Investigations';
      case 'core-informations':
        return 'Core Informations';
      case 'treatment-medications':
        return 'Treatment / Medications';
      case 'self-management':
        return 'Self-management';
      case 'urgent-items':
        return 'Urgent Items';
      default:
        return 'Investigations';
    }
  };

  const handleInvestigationPress = (investigationId: string) => {
    router.push(`/my-reports/${id}/${subcategoryId}/${investigationId}` as any);
  };

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.background}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTitle()}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.divider} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentHorizontal}
      >
        {CORE_INVESTIGATIONS.map((investigation, index) => (
          <TouchableOpacity
            key={investigation.id}
            style={[
              styles.investigationCard,
              index === CORE_INVESTIGATIONS.length - 1 && styles.lastCard
            ]}
            onPress={() => handleInvestigationPress(investigation.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.investigationName}>{investigation.name}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
};
