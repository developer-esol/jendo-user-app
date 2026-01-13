import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { Header } from '../../../common/components/ui';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../config/theme.config';
import { useLearningMaterialDetail } from '../hooks/useLearningMaterials';

const { width } = Dimensions.get('window');

// Extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export default function MaterialDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: material, loading, error } = useLearningMaterialDetail(Number(id));
  const [playing, setPlaying] = useState(false);

  if (loading) {
    return (
      <ScreenWrapper safeArea>
        <Header title="Loading..." showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  if (error || !material) {
    return (
      <ScreenWrapper safeArea>
        <Header title="Error" showBack />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error || 'Material not found'}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const videoId = material.videoUrl ? getYouTubeVideoId(material.videoUrl) : null;

  return (
    <ScreenWrapper safeArea>
      <Header title={material.title} showBack />
      <ScrollView style={styles.container}>
        {/* Video Player */}
        {videoId && material.type === 'VIDEO' && (
          <View style={styles.videoContainer}>
            <YoutubePlayer
              height={220}
              width={width}
              play={playing}
              videoId={videoId}
              onChangeState={(state: string) => {
                if (state === 'ended') {
                  setPlaying(false);
                }
              }}
            />
          </View>
        )}

        {/* Material Info */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{material.title}</Text>

          {/* Metadata */}
          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <Ionicons name="person" size={16} color={COLORS.textSecondary} />
              <Text style={styles.metadataText}>{material.author}</Text>
            </View>
            <View style={styles.metadataItem}>
              <Ionicons name="time" size={16} color={COLORS.textSecondary} />
              <Text style={styles.metadataText}>{material.duration}</Text>
            </View>
          </View>

          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{material.category}</Text>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{material.description}</Text>

          {/* Type Info */}
          <View style={styles.typeContainer}>
            <Ionicons 
              name={material.type === 'VIDEO' ? 'play-circle' : 'document-text'} 
              size={20} 
              color={COLORS.primary} 
            />
            <Text style={styles.typeText}>{material.type}</Text>
          </View>

          {/* Created Date */}
          <Text style={styles.dateText}>
            Published: {new Date(material.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    width: '100%',
    backgroundColor: '#000',
  },
  contentContainer: {
    padding: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  metadataRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metadataText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  typeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  dateText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.error,
    textAlign: 'center',
  },
});
