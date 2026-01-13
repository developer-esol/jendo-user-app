import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { wellnessStyles as styles } from '../components';
import { useLearningMaterials } from '../../learning/hooks/useLearningMaterials';
import { LearningMaterial } from '../../learning/types';
import { useAuth } from '../../../providers/AuthProvider';
import { DailyAiTipsResponse, WellnessRecommendation, wellnessRecommendationApi } from '../services/wellnessRecommendationApi';

const getCategoryColor = (category: string): { bg: string; text: string } => {
  const colors: Record<string, { bg: string; text: string }> = {
    'Mental Health': { bg: '#FCE4EC', text: '#E91E63' },
    'Stress': { bg: '#FCE4EC', text: '#E91E63' },
    'Nutrition': { bg: '#E8F5E9', text: '#4CAF50' },
    'Exercise': { bg: '#FFF3E0', text: '#FF9800' },
    'Cardiology': { bg: '#E3F2FD', text: '#2196F3' },
  };
  return colors[category] || { bg: '#F5F5F5', text: '#757575' };
};

export const WellnessScreen: React.FC = () => {
  const router = useRouter();
  const { data: learningData, loading: learningLoading } = useLearningMaterials(0, 5);
  const { user } = useAuth();
  const [dailyTips, setDailyTips] = useState<DailyAiTipsResponse | null>(null);
  const [dailyLoading, setDailyLoading] = useState(true);

  useEffect(() => {
    const loadDailyTips = async () => {
      const userId = Number(user?.id);
      if (!userId || Number.isNaN(userId)) {
        setDailyLoading(false);
        setDailyTips(null);
        return;
      }
      try {
        setDailyLoading(true);
        const tips = await wellnessRecommendationApi.getDailyAiTipsForUser(userId);
        setDailyTips(tips);
      } catch (error) {
        console.error('Error fetching daily AI tips:', error);
        setDailyTips(null);
      } finally {
        setDailyLoading(false);
      }
    };

    loadDailyTips();
  }, [user?.id]);

  const dailyCategories = useMemo(
    () => [
      { key: 'diet', title: 'Diet', palette: { bg: '#E8F5E9', text: '#4CAF50' }, icon: 'nutrition' as const },
      { key: 'exercise', title: 'Exercise', palette: { bg: '#FFF3E0', text: '#FF9800' }, icon: 'barbell' as const },
      { key: 'sleep', title: 'Sleep', palette: { bg: '#E3F2FD', text: '#2196F3' }, icon: 'moon' as const },
      { key: 'stress', title: 'Stress', palette: { bg: '#FCE4EC', text: '#E91E63' }, icon: 'heart' as const },
    ],
    []
  );

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.white}>
      <View style={styles.header}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="finger-print" size={24} color={COLORS.primary} />
        </View>
        <Text style={styles.headerTitle}>Wellness Recommendations</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => router.push('/notifications')}
        >
          <Ionicons name="notifications" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.healthPlanBanner}>
          <Text style={styles.healthPlanTitle}>Your Personal Health Plan</Text>
          <Text style={styles.healthPlanSubtitle}>
            Customized recommendations based on{'\n'}your health profile
          </Text>
          <View style={styles.riskIndicators}>
            <View style={styles.riskIndicator}>
              <View style={[styles.riskDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.riskText}>Low{'\n'}Risk</Text>
            </View>
            <View style={styles.riskIndicator}>
              <View style={[styles.riskDot, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.riskText}>Medium{'\n'}Risk</Text>
            </View>
            <View style={styles.riskIndicator}>
              <View style={[styles.riskDot, { backgroundColor: '#E53935' }]} />
              <Text style={styles.riskText}>High{'\n'}Risk</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={styles.sectionTitle}>Daily Tips</Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>Swipe to explore</Text>
          </View>

          {dailyLoading ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={{ marginTop: 8, color: COLORS.textSecondary }}>Loading personalized tips...</Text>
            </View>
          ) : dailyTips ? (
            dailyCategories.map((category) => {
              const tips = (dailyTips as Record<string, WellnessRecommendation[] | undefined>)[category.key] || [];
              if (tips.length === 0) return null;
              return (
                <View key={category.key} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: category.palette.bg, justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                      <Ionicons name={category.icon} size={18} color={category.palette.text} />
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.textPrimary }}>{category.title}</Text>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 4 }}>
                    {tips.map((tip, index) => (
                      <TouchableOpacity
                        key={tip.id ?? `${category.key}-${index}`}
                        style={{
                          width: 240,
                          marginRight: 12,
                          backgroundColor: COLORS.white,
                          borderRadius: 16,
                          padding: 14,
                          borderWidth: 1,
                          borderColor: COLORS.borderLight,
                        }}
                        onPress={() =>
                          router.push({
                            pathname: `/wellness/${category.key}`,
                            params: { tip: JSON.stringify(tip) },
                          })
                        }
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: category.palette.text, marginRight: 6 }} />
                          <Text style={{ fontSize: 13, fontWeight: '600', color: category.palette.text }}>{category.title}</Text>
                        </View>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.textPrimary }} numberOfLines={2}>
                          {tip.title}
                        </Text>
                        <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 6 }} numberOfLines={3}>
                          {tip.description}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              );
            })
          ) : (
            <View style={{ paddingVertical: 12 }}>
              <Text style={{ color: COLORS.textSecondary }}>No daily tips available right now.</Text>
            </View>
          )}
        </View>

        <View style={styles.learnSection}>
          <View style={styles.learnHeader}>
            <View style={[styles.learnIconContainer, { backgroundColor: '#F3E5F5' }]}>
              <MaterialCommunityIcons name="lightbulb-on" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.learnTitleContainer}>
              <Text style={styles.learnTitle}>Learn & Improve</Text>
              <Text style={styles.learnSubtitle}>Watch videos and explore wellness guides</Text>
            </View>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilters}
          >
            <TouchableOpacity style={[styles.categoryChip, styles.categoryChipActive]}>
              <Text style={[styles.categoryChipText, styles.categoryChipTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>Diet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>Exercise</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>Stress</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>Sleep</Text>
            </TouchableOpacity>
          </ScrollView>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.videosScroll}
          >
            {learningLoading ? (
              <View style={{ padding: 20 }}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : learningData && learningData.content.length > 0 ? (
              learningData.content.map((material: LearningMaterial) => {
                const categoryColor = getCategoryColor(material.category);
                return (
                  <TouchableOpacity 
                    key={material.id}
                    style={styles.videoCard}
                    onPress={() => router.push('/wellness/learning')}
                  >
                    <View style={[styles.videoThumbnail, { backgroundColor: categoryColor.bg }]}>
                      <View style={styles.playButton}>
                        <Ionicons name="play" size={20} color={COLORS.white} />
                      </View>
                      <View style={styles.videoDuration}>
                        <Text style={styles.videoDurationText}>{material.duration}</Text>
                      </View>
                    </View>
                    <Text style={styles.videoTitle} numberOfLines={2}>
                      {material.title}
                    </Text>
                    <View style={[styles.videoCategory, { backgroundColor: categoryColor.bg }]}>
                      <Text style={[styles.videoCategoryText, { color: categoryColor.text }]}>
                        {material.category}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={{ padding: 20 }}>
                <Text style={{ color: COLORS.textSecondary }}>No materials available</Text>
              </View>
            )}
          </ScrollView>
        </View>

        <TouchableOpacity 
          style={styles.chatbotCard}
          onPress={() => router.push('/wellness/chatbot')}
        >
          <View style={styles.chatbotIconContainer}>
            <MaterialCommunityIcons name="robot" size={28} color={COLORS.primary} />
          </View>
          <View style={styles.chatbotContent}>
            <Text style={styles.chatbotTitle}>Health Assistant</Text>
            <Text style={styles.chatbotDescription}>
              Ask questions about your heart health and get personalized advice
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.textMuted} />
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </ScreenWrapper>
  );
};
