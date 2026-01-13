import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { medicalRecordsStyles as styles } from '../components';
import { reportApi, ReportSection } from '../services/reportApi';

const SECTION_THEMES = [
  { bgColor: '#E3F2FD', iconBg: '#BBDEFB', iconColor: '#1976D2' },
  { bgColor: '#E8F5E9', iconBg: '#C8E6C9', iconColor: '#388E3C' },
  { bgColor: '#F3E5F5', iconBg: '#E1BEE7', iconColor: '#7B1FA2' },
  { bgColor: '#FFF3E0', iconBg: '#FFE0B2', iconColor: '#F57C00' },
  { bgColor: '#FFEBEE', iconBg: '#FFCDD2', iconColor: '#D32F2F' },
  { bgColor: '#E0F7FA', iconBg: '#B2EBF2', iconColor: '#0097A7' },
];

const SECTION_ICONS: Record<string, { icon: string; iconType: 'ionicons' | 'material-community' }> = {
  'core informations': { icon: 'information-circle', iconType: 'ionicons' },
  'core investigations': { icon: 'flask', iconType: 'ionicons' },
  'treatment': { icon: 'medkit', iconType: 'ionicons' },
  'medications': { icon: 'medical', iconType: 'ionicons' },
  'self-management': { icon: 'heart', iconType: 'ionicons' },
  'lifestyle': { icon: 'heart', iconType: 'ionicons' },
  'urgent': { icon: 'warning', iconType: 'ionicons' },
  'red-flag': { icon: 'alert-circle', iconType: 'ionicons' },
  'cardiac': { icon: 'heart-pulse', iconType: 'material-community' },
  'blood pressure': { icon: 'pulse', iconType: 'ionicons' },
  'lipid': { icon: 'water', iconType: 'ionicons' },
  'imaging': { icon: 'scan', iconType: 'ionicons' },
  'risk': { icon: 'shield-checkmark', iconType: 'ionicons' },
  'prenatal': { icon: 'fitness', iconType: 'ionicons' },
  'ultrasound': { icon: 'radio', iconType: 'ionicons' },
  'blood work': { icon: 'water', iconType: 'ionicons' },
  'glucose': { icon: 'analytics', iconType: 'ionicons' },
  'complete blood': { icon: 'water', iconType: 'ionicons' },
  'metabolic': { icon: 'flask', iconType: 'ionicons' },
  'thyroid': { icon: 'pulse', iconType: 'ionicons' },
  'liver': { icon: 'fitness', iconType: 'ionicons' },
  'kidney': { icon: 'filter', iconType: 'ionicons' },
  'x-ray': { icon: 'scan', iconType: 'ionicons' },
  'ct scan': { icon: 'layers', iconType: 'ionicons' },
  'mri': { icon: 'scan-circle', iconType: 'ionicons' },
  'skin': { icon: 'hand-left', iconType: 'ionicons' },
  'allergy': { icon: 'alert', iconType: 'ionicons' },
  'eeg': { icon: 'pulse', iconType: 'ionicons' },
  'nerve': { icon: 'flash', iconType: 'ionicons' },
  'brain': { icon: 'ellipse', iconType: 'ionicons' },
};

const getSectionIcon = (sectionName: string) => {
  const nameLower = sectionName.toLowerCase();
  for (const [key, value] of Object.entries(SECTION_ICONS)) {
    if (nameLower.includes(key)) {
      return value;
    }
  }
  return { icon: 'folder', iconType: 'ionicons' as const };
};

export const CategoryDetailScreen: React.FC = () => {
  const router = useRouter();
  const { categoryId, categoryName } = useLocalSearchParams<{ categoryId: string; categoryName: string }>();
  
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(categoryId);
    if (categoryId && !isNaN(id) && id > 0) {
      loadSections(id);
    } else if (categoryId) {
      setError('Invalid category ID');
      setLoading(false);
    }
  }, [categoryId]);

  const loadSections = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportApi.getSectionsByCategory(id);
      setSections(data);
    } catch (err: any) {
      console.error('Error loading sections:', err);
      setError(err.message || 'Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionPress = (section: ReportSection) => {
    router.push({
      pathname: '/my-reports/[categoryId]/[sectionId]',
      params: { 
        categoryId: categoryId || '', 
        sectionId: section.id.toString(),
        sectionName: section.name,
        categoryName: categoryName || ''
      }
    } as any);
  };

  const getThemeForIndex = (index: number) => {
    return SECTION_THEMES[index % SECTION_THEMES.length];
  };

  const renderIcon = (section: ReportSection, theme: typeof SECTION_THEMES[0]) => {
    const iconSize = 24;
    const iconConfig = getSectionIcon(section.name);
    
    try {
      if (iconConfig.iconType === 'material-community') {
        return <MaterialCommunityIcons name={iconConfig.icon as any} size={iconSize} color={theme.iconColor} />;
      }
      return <Ionicons name={iconConfig.icon as any} size={iconSize} color={theme.iconColor} />;
    } catch {
      return <Ionicons name="folder" size={iconSize} color={theme.iconColor} />;
    }
  };

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.background}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName || 'Category'}</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 16, color: COLORS.textSecondary }}>Loading sections...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
          <Text style={{ marginTop: 16, color: COLORS.error, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity 
            style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: 8 }}
            onPress={() => loadSections(Number(categoryId))}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : sections.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Ionicons name="folder-open-outline" size={64} color={COLORS.textSecondary} />
          <Text style={{ marginTop: 16, color: COLORS.textSecondary, textAlign: 'center' }}>
            No sections available in this category.
          </Text>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {sections.map((section, index) => {
            const theme = getThemeForIndex(index);
            return (
              <TouchableOpacity
                key={section.id}
                style={[styles.subcategoryCard, { backgroundColor: theme.bgColor }]}
                onPress={() => handleSectionPress(section)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainerWhite, { backgroundColor: theme.iconBg }]}>
                  {renderIcon(section, theme)}
                </View>
                <View style={styles.subcategoryInfo}>
                  <Text style={styles.subcategoryName}>{section.name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
};
