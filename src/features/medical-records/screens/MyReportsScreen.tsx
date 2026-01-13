import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { medicalRecordsStyles as styles } from '../components';
import { reportApi, ReportCategory } from '../services/reportApi';

const ICON_MAP: Record<string, { icon: string; iconType: 'ionicons' | 'material-community' | 'fontawesome5' }> = {
  'diabetes': { icon: 'water', iconType: 'ionicons' },
  'cardiovascular': { icon: 'heart', iconType: 'ionicons' },
  'pregnancy': { icon: 'human-pregnant', iconType: 'material-community' },
  'blood-tests': { icon: 'flask', iconType: 'ionicons' },
  'blood': { icon: 'flask', iconType: 'ionicons' },
  'radiology': { icon: 'scan-outline', iconType: 'ionicons' },
  'dermatology': { icon: 'hand-left', iconType: 'ionicons' },
  'neurology': { icon: 'brain', iconType: 'fontawesome5' },
  'default': { icon: 'folder', iconType: 'ionicons' },
};

const getIconConfig = (categoryName: string, categoryIcon: string | null) => {
  if (categoryIcon && ICON_MAP[categoryIcon.toLowerCase()]) {
    return ICON_MAP[categoryIcon.toLowerCase()];
  }
  const nameLower = categoryName.toLowerCase();
  for (const key of Object.keys(ICON_MAP)) {
    if (nameLower.includes(key)) {
      return ICON_MAP[key];
    }
  }
  return ICON_MAP['default'];
};

export const MyReportsScreen: React.FC = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportApi.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Error loading categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category: ReportCategory) => {
    router.push({
      pathname: '/my-reports/[categoryId]',
      params: { categoryId: category.id.toString(), categoryName: category.name }
    } as any);
  };

  const renderIcon = (category: ReportCategory) => {
    const config = getIconConfig(category.name, category.icon);
    const iconSize = 32;
    const iconColor = COLORS.primary;

    try {
      switch (config.iconType) {
        case 'material-community':
          return <MaterialCommunityIcons name={config.icon as any} size={iconSize} color={iconColor} />;
        case 'fontawesome5':
          return <FontAwesome5 name={config.icon as any} size={iconSize} color={iconColor} />;
        default:
          return <Ionicons name={config.icon as any} size={iconSize} color={iconColor} />;
      }
    } catch {
      return <Ionicons name="folder" size={iconSize} color={iconColor} />;
    }
  };

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.background}>
      <View style={styles.header}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="finger-print" size={24} color={COLORS.primary} />
        </View>
        <Text style={styles.headerTitle}>My Reports</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => router.push('/notifications' as any)}
        >
          <Ionicons name="notifications" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 16, color: COLORS.textSecondary }}>Loading categories...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
          <Text style={{ marginTop: 16, color: COLORS.error, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity 
            style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: 8 }}
            onPress={loadCategories}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {categories.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
              <Ionicons name="folder-open-outline" size={64} color={COLORS.textSecondary} />
              <Text style={{ marginTop: 16, color: COLORS.textSecondary, textAlign: 'center' }}>
                No report categories available yet.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.categoriesGrid}>
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      index === categories.length - 1 && categories.length % 2 !== 0 && styles.singleCard
                    ]}
                    onPress={() => handleCategoryPress(category)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconContainer}>
                      {renderIcon(category)}
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.recentSection}>
                <Text style={styles.recentTitle}>Recent Activity</Text>
                <TouchableOpacity style={styles.activityCard} activeOpacity={0.7}>
                  <View style={[styles.activityIcon, { backgroundColor: '#FCE4EC' }]}>
                    <Ionicons name="document-text" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>Blood Sugar Report</Text>
                    <Text style={styles.activityTime}>Added 2 hours ago</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
};
