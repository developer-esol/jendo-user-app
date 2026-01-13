import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { medicalRecordsStyles as styles } from '../components';
import { reportApi, ReportItem } from '../services/reportApi';

export const SectionDetailScreen: React.FC = () => {
  const router = useRouter();
  const { categoryId, sectionId, sectionName, categoryName } = useLocalSearchParams<{ 
    categoryId: string; 
    sectionId: string; 
    sectionName: string;
    categoryName: string;
  }>();
  
  const [items, setItems] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(sectionId);
    if (sectionId && !isNaN(id) && id > 0) {
      loadItems(id);
    } else if (sectionId) {
      setError('Invalid section ID');
      setLoading(false);
    }
  }, [sectionId]);

  const loadItems = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportApi.getItemsBySection(id);
      setItems(data);
    } catch (err: any) {
      console.error('Error loading items:', err);
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item: ReportItem) => {
    router.push({
      pathname: '/my-reports/[categoryId]/[sectionId]/[itemId]',
      params: { 
        categoryId: categoryId || '',
        sectionId: sectionId || '',
        itemId: item.id.toString(),
        itemName: item.name,
        sectionName: sectionName || '',
        categoryName: categoryName || ''
      }
    } as any);
  };

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.background}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{sectionName || 'Section'}</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 16, color: COLORS.textSecondary }}>Loading tests...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
          <Text style={{ marginTop: 16, color: COLORS.error, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity 
            style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: 8 }}
            onPress={() => loadItems(Number(sectionId))}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Ionicons name="document-text-outline" size={64} color={COLORS.textSecondary} />
          <Text style={{ marginTop: 16, color: COLORS.textSecondary, textAlign: 'center' }}>
            No tests available in this section.
          </Text>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {items.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.investigationCard,
                index === items.length - 1 && styles.lastCard
              ]}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.investigationName}>{item.name}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
};
