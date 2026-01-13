import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { wellnessStyles as styles } from '../components';
import { wellnessRecommendationApi, WellnessRecommendation } from '../services/wellnessRecommendationApi';
import { useAuth } from '../../../providers/AuthProvider';

const getRiskColor = (level: string): string => {
  switch (level?.toLowerCase()) {
    case 'low': return '#4CAF50';
    case 'moderate': return '#FF9800';
    case 'high': return '#F44336';
    default: return '#6B7280';
  }
};

const getRiskBgColor = (level: string): string => {
  switch (level?.toLowerCase()) {
    case 'low': return '#E8F5E9';
    case 'moderate': return '#FFF3E0';
    case 'high': return '#FFEBEE';
    default: return '#F5F5F5';
  }
};

const getRiskIcon = (level: string): keyof typeof Ionicons.glyphMap => {
  switch (level?.toLowerCase()) {
    case 'low': return 'checkmark-circle';
    case 'moderate': return 'warning';
    case 'high': return 'alert-circle';
    default: return 'help-circle';
  }
};

export const StressManagementScreen: React.FC = () => {
  const router = useRouter();
  const { tip: tipParam } = useLocalSearchParams<{ tip?: string }>();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<WellnessRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskLevel, setRiskLevel] = useState<string>('low');

  const parseTipParam = (param?: string | string[]): WellnessRecommendation | null => {
    const raw = Array.isArray(param) ? param[0] : param;
    if (!raw) return null;
    try {
      return JSON.parse(raw) as WellnessRecommendation;
    } catch (err) {
      console.warn('Failed to parse tip param', err);
      return null;
    }
  };

  useEffect(() => {
    const parsedTip = parseTipParam(tipParam);
    if (parsedTip) {
      setRecommendations([parsedTip]);
      setRiskLevel(parsedTip.riskLevel?.toLowerCase() || 'low');
      setLoading(false);
    } else {
      loadRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipParam, user?.id]);

  const loadRecommendations = async () => {
    const userId = Number(user?.id);
    if (!userId || Number.isNaN(userId)) {
      setLoading(false);
      setRecommendations([]);
      setRiskLevel('low');
      return;
    }

    try {
      setLoading(true);
      const dailyTips = await wellnessRecommendationApi.getDailyAiTipsForUser(userId);
      const stressTips = dailyTips?.stress || [];

      if (stressTips.length > 0) {
        setRiskLevel(stressTips[0].riskLevel?.toLowerCase() || 'low');
      } else {
        setRiskLevel('low');
      }

      setRecommendations(stressTips);
    } catch (error) {
      console.error('Error loading stress recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const capitalizeRiskLevel = (level: string): string => {
    if (!level) return 'Unknown';
    return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
  };

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.white}>
      <View style={styles.headerWithBack}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stress & Monitoring</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => router.push('/notifications')}
        >
          <Ionicons name="notifications" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentPadded}
      >
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#FCE4EC' }]}>
              <MaterialCommunityIcons name="heart-pulse" size={28} color="#E91E63" />
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>Stress & Monitoring</Text>
              <View style={styles.riskBadge}>
                <View style={[styles.riskDotSmall, { backgroundColor: getRiskColor(riskLevel) }]} />
                <Text style={[styles.riskTextSmall, { color: getRiskColor(riskLevel) }]}>
                  {capitalizeRiskLevel(riskLevel)} Risk
                </Text>
              </View>
            </View>
          </View>

          {loading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={{ marginTop: 12, color: COLORS.textSecondary }}>
                Loading personalized recommendations...
              </Text>
            </View>
          ) : recommendations.length > 0 ? (
            <View style={styles.tipsContainer}>
              {recommendations.map((tip, index) => (
                <View
                  key={tip.id ?? `${tip.category || 'stress'}-${index}`}
                  style={[styles.tipCardColored, { backgroundColor: getRiskBgColor(riskLevel) }]}
                >
                  <View style={styles.checkIcon}>
                    <Ionicons name={getRiskIcon(riskLevel)} size={22} color={getRiskColor(riskLevel)} />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipDescription}>{tip.description}</Text>
                    {tip.longDescription ? (
                      <Text style={[styles.tipDescription, { marginTop: 6 }]}>
                        {tip.longDescription}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <MaterialCommunityIcons name="heart-pulse" size={48} color={COLORS.textMuted} />
              <Text style={{ marginTop: 12, color: COLORS.textSecondary, textAlign: 'center' }}>
                No monitoring recommendations available for your current risk level.
              </Text>
            </View>
          )}
        </View>

        <View style={{ 
          backgroundColor: getRiskBgColor(riskLevel), 
          borderRadius: 12, 
          padding: 16, 
          marginTop: 16 
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="information-circle" size={20} color={getRiskColor(riskLevel)} />
            <Text style={{ marginLeft: 8, fontWeight: '600', color: getRiskColor(riskLevel) }}>
              Your Risk Level: {capitalizeRiskLevel(riskLevel)}
            </Text>
          </View>
          <Text style={{ color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 }}>
            These monitoring and stress management recommendations are personalized based on your latest Jendo test results. 
            Regular health monitoring helps you stay on top of your cardiovascular health.
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};
