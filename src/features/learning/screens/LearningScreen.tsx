import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { Header, Card } from '../../../common/components/ui';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../config/theme.config';
import { useLearningMaterials, useLearningMaterialsByCategory, useSearchLearningMaterials } from '../hooks/useLearningMaterials';
import { LearningMaterial, LearningMaterialType, LearningMaterialCategory } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.md * 3) / 2;

const categories: LearningMaterialCategory[] = [
  'All',
  'Cardiology',
  'Nutrition',
  'Exercise',
  'Mental Health',
  'General Health'
];

const getTypeIcon = (type: LearningMaterialType): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'VIDEO':
      return 'play-circle';
    case 'ARTICLE':
      return 'document-text';
    case 'PODCAST':
      return 'mic';
    case 'PDF':
      return 'document';
    default:
      return 'document';
  }
};

const getTypeColor = (type: LearningMaterialType): string => {
  switch (type) {
    case 'VIDEO':
      return COLORS.primary;
    case 'ARTICLE':
      return '#FF6B6B';
    case 'PODCAST':
      return '#4ECDC4';
    case 'PDF':
      return '#FFD93D';
    default:
      return COLORS.textSecondary;
  }
};

interface MaterialCardProps {
  material: LearningMaterial;
  onPress: () => void;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ material, onPress }) => {
  const typeColor = getTypeColor(material.type);
  const typeIcon = getTypeIcon(material.type);

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={[styles.cardHeader, { backgroundColor: typeColor + '20' }]}>
        <Ionicons name={typeIcon} size={48} color={typeColor} />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{material.duration}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {material.title}
        </Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {material.description}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.authorText} numberOfLines={1}>
            {material.author}
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{material.category}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function LearningScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<LearningMaterialCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const allMaterials = useLearningMaterials(0, 20);
  const categoryMaterials = useLearningMaterialsByCategory(
    selectedCategory,
    0,
    20
  );
  const searchResults = useSearchLearningMaterials(searchQuery, 0, 20);

  const getDisplayData = () => {
    if (searchQuery && searchQuery.length >= 3) {
      return { ...searchResults, refetch: () => {} };
    }
    if (selectedCategory !== 'All') {
      return categoryMaterials;
    }
    return allMaterials;
  };

  const { data, loading, error, refetch } = getDisplayData();

  const handleMaterialPress = (material: LearningMaterial) => {
    console.log('Material pressed:', material.title);
    router.push(`/wellness/learning/${material.id}` as any);
  };

  const renderMaterials = () => {
    if (loading && !data) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading materials...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refetch} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!data || data.content.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="folder-open-outline" size={48} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No materials found</Text>
        </View>
      );
    }

    return (
      <View style={styles.materialsGrid}>
        {data.content.map((material) => (
          <MaterialCard
            key={material.id}
            material={material}
            onPress={() => handleMaterialPress(material)}
          />
        ))}
      </View>
    );
  };

  return (
    <ScreenWrapper safeArea>
      <Header title="Learn & Improve" showBack />
      
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      >
        {/* Description */}
        <Text style={styles.subtitle}>
          Watch videos and explore wellness guides
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search materials..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive
              ]}
              onPress={() => {
                setSelectedCategory(category);
                setSearchQuery('');
              }}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Materials Grid */}
        {renderMaterials()}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    height: 48,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  categoriesContainer: {
    marginBottom: SPACING.md,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
    marginRight: SPACING.sm,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  materialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  durationBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
  },
  cardContent: {
    padding: SPACING.sm,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  authorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: SPACING.xs,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  errorText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.error,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  retryButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
});
