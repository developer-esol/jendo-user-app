import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { COLORS } from '../../../config/theme.config';
import { dashboardStyles as styles } from '../components';
import { JendoScoreChart } from '../components/JendoScoreChart';
import { useUserStore } from '../../../state/userSlice';
import { useToast } from '../../../providers/ToastProvider';
import { jendoTestApi, JendoTest } from '../../jendo-tests/services/jendoTestApi';
import { useAuth } from '../../../providers/AuthProvider';
import { wellnessRecommendationApi, WellnessRecommendation, DailyAiTipsResponse } from '../../wellness/services/wellnessRecommendationApi';

const { width } = Dimensions.get('window');

const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '--';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      timeZone: 'Asia/Colombo'
    });
  } catch {
    return dateString;
  }
};

const formatShortDate = (dateString: string): string => {
  if (!dateString) return '--';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      timeZone: 'Asia/Colombo'
    });
  } catch {
    return dateString;
  }
};

const capitalizeRiskLevel = (level: string): string => {
  if (!level) return 'Unknown';
  return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
};

const getRiskColor = (level: string): string => {
  switch (level?.toLowerCase()) {
    case 'low':
      return '#4CAF50';
    case 'moderate':
      return '#FF9800';
    case 'high':
      return '#F44336';
    default:
      return COLORS.textMuted;
  }
};

const getRiskIcon = (level: string): keyof typeof Ionicons.glyphMap => {
  switch (level?.toLowerCase()) {
    case 'low':
      return 'checkmark-circle';
    case 'moderate':
      return 'alert-circle';
    case 'high':
      return 'warning';
    default:
      return 'help-circle';
  }
};

const getCategoryIcon = (category: string): { name: keyof typeof Ionicons.glyphMap; color: string } => {
  switch (category?.toLowerCase()) {
    case 'blood pressure':
      return { name: 'heart', color: '#EF4444' };
    case 'nutrition':
    case 'diet':
      return { name: 'nutrition', color: '#22C55E' };
    case 'exercise':
      return { name: 'walk', color: '#3B82F6' };
    case 'medical':
      return { name: 'medical', color: '#EF4444' };
    case 'wellness':
      return { name: 'leaf', color: '#8B5CF6' };
    case 'monitoring':
      return { name: 'pulse', color: '#6366F1' };
    default:
      return { name: 'fitness', color: COLORS.primary };
  }
};

const calculateBMI = (weight?: number, height?: number): { value: string; status: string; color: string } => {
  if (!weight || !height) {
    return { value: '--', status: 'Not set', color: COLORS.textMuted };
  }
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  const bmiValue = bmi.toFixed(1);
  
  if (bmi < 18.5) return { value: bmiValue, status: 'Underweight', color: '#FF9800' };
  if (bmi < 25) return { value: bmiValue, status: 'Normal', color: '#4CAF50' };
  if (bmi < 30) return { value: bmiValue, status: 'Overweight', color: '#FF9800' };
  return { value: bmiValue, status: 'Obese', color: '#F44336' };
};

const calculateProfileCompletion = (user: any): number => {
  if (!user) return 0;
  
  const requiredFields = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'dateOfBirth',
    'gender',
    'weight',
    'height',
    'address',
    'nationality',
  ];
  
  let completedFields = 0;
  for (const field of requiredFields) {
    if (user[field] !== undefined && user[field] !== null && user[field] !== '') {
      completedFields++;
    }
  }
  
  return Math.round((completedFields / requiredFields.length) * 100);
};

const calculateScoreTrend = (tests: JendoTest[]): string => {
  if (tests.length < 2) return '--';
  const recent = tests[0].score;
  const older = tests[tests.length - 1].score;
  const diff = ((recent - older) / older) * 100;
  if (diff > 0) return `+${diff.toFixed(1)}%`;
  return `${diff.toFixed(1)}%`;
};

export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useUserStore();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const hasShownCompleteToast = useRef(false);
  
  const [jendoTests, setJendoTests] = useState<JendoTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [wellnessRecommendations, setWellnessRecommendations] = useState<WellnessRecommendation[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  const bmiData = useMemo(() => calculateBMI(user?.weight, user?.height), [user?.weight, user?.height]);
  const profileComplete = useMemo(() => calculateProfileCompletion(user), [user]);

  const flattenDailyTips = (tips: DailyAiTipsResponse | null): WellnessRecommendation[] => {
    if (!tips) return [];
    return Object.values(tips).reduce<WellnessRecommendation[]>((acc, list) => {
      if (list && Array.isArray(list)) {
        acc.push(...list);
      }
      return acc;
    }, []);
  };

  const fetchJendoTests = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const tests = await jendoTestApi.getTestsByUserId(Number(user.id));
      const sortedTests = tests.sort((a, b) => {
        const dateTimeA = new Date(`${a.testDate}T${a.testTime || '00:00:00'}`).getTime();
        const dateTimeB = new Date(`${b.testDate}T${b.testTime || '00:00:00'}`).getTime();
        return dateTimeB - dateTimeA;
      });
      setJendoTests(sortedTests);
    } catch (error) {
      console.error('Failed to fetch Jendo tests:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    fetchJendoTests();
  }, [fetchJendoTests]);

  const fetchWellnessRecommendations = useCallback(async () => {
    const userId = Number(user?.id);
    if (!userId || Number.isNaN(userId)) {
      setWellnessRecommendations([]);
      return;
    }
    try {
      setRecommendationsLoading(true);
      const dailyTips = await wellnessRecommendationApi.getDailyAiTipsForUser(userId);
      const flattened = flattenDailyTips(dailyTips);
      setWellnessRecommendations(flattened.slice(0, 12));
    } catch (error) {
      console.error('Failed to fetch wellness recommendations:', error);
      setWellnessRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchWellnessRecommendations();
  }, [fetchWellnessRecommendations]);

  useEffect(() => {
    if (profileComplete === 100 && !hasShownCompleteToast.current) {
      hasShownCompleteToast.current = true;
      showToast('Your profile is completed!', 'success');
    } else if (profileComplete < 100) {
      hasShownCompleteToast.current = false;
    }
  }, [profileComplete, showToast]);

  const latestTest = jendoTests[0] || null;
  const scoreHistory = useMemo(() => {
    return jendoTests.slice(0, 6).reverse().map(test => ({
      date: formatShortDate(test.testDate),
      value: test.score,
    }));
  }, [jendoTests]);

  const scoreTrend = useMemo(() => calculateScoreTrend(jendoTests.slice(0, 6)), [jendoTests]);

  const dashboardData = {
    userName: user?.firstName || 'User',
    profileComplete,
    riskLevel: latestTest ? capitalizeRiskLevel(latestTest.riskLevel) : 'Unknown',
    lastTestDate: latestTest ? formatDateForDisplay(latestTest.testDate) : 'No tests yet',
    scoreHistory,
    scoreTrend,
    healthOverview: {
      bloodPressure: { 
        value: latestTest?.bloodPressure || '--', 
        status: latestTest ? 'Recent' : 'No data', 
        trend: 'up' 
      },
      spo2: {
        value: latestTest?.spo2 ? `${latestTest.spo2}%` : '--',
        status: latestTest?.spo2 ? (latestTest.spo2 >= 95 ? 'Normal' : 'Low') : 'No data',
        color: latestTest?.spo2 ? (latestTest.spo2 >= 95 ? '#4CAF50' : '#FF9800') : COLORS.textMuted
      },
      bmi: { value: bmiData.value, status: bmiData.status, color: bmiData.color },
      heartRate: {
        value: latestTest?.heartRate ? `${latestTest.heartRate} bpm` : '--',
        status: latestTest?.heartRate ? 'Latest' : 'No data'
      },
    },
    notificationCount: 3,
  };

  const hasTestData = jendoTests.length > 0;

  return (
    <ScreenWrapper safeArea padded={false} backgroundColor={COLORS.background}>
      <View style={styles.header}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="finger-print" size={24} color={COLORS.primary} />
        </View>
        <Text style={styles.headerTitle}>Home</Text>
        <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>Hello, {dashboardData.userName}</Text>
          <Text style={styles.subtitle}>Here is your cardiovascular health summary</Text>
        </View>

        {profileComplete < 100 && (
          <TouchableOpacity style={styles.profileCard} onPress={() => router.push('/profile/personal')}>
            <View style={styles.profileCardRow}>
              <View style={styles.profileIconContainer}>
                <Ionicons name="person" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.profileText}>Profile {dashboardData.profileComplete}% Completed</Text>
            </View>
            <View style={styles.profileProgressRow}>
              <View style={styles.profileProgressBg}>
                <View style={[styles.profileProgress, { width: `${dashboardData.profileComplete}%` }]} />
              </View>
              <Text style={styles.completeNowText}>Complete Now</Text>
            </View>
          </TouchableOpacity>
        )}

        {loading ? (
          <View style={[styles.riskCard, { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ marginTop: 12, color: COLORS.textMuted }}>Loading health data...</Text>
          </View>
        ) : (
          <View style={styles.riskCard}>
            <View style={styles.riskCardContent}>
              <View style={styles.riskCardLeft}>
                <Text style={styles.riskCardTitle}>Jendo Risk Level</Text>
                <View style={styles.riskLevelRow}>
                  <Text style={[styles.riskLevelText, { color: getRiskColor(dashboardData.riskLevel) }]}>
                    {dashboardData.riskLevel}
                  </Text>
                  <Ionicons 
                    name={getRiskIcon(dashboardData.riskLevel)} 
                    size={24} 
                    color={getRiskColor(dashboardData.riskLevel)} 
                  />
                </View>
                <Text style={styles.lastTestLabel}>Last Test Date</Text>
                <Text style={styles.lastTestDate}>{dashboardData.lastTestDate}</Text>
                {latestTest && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.lastTestLabel}>Score</Text>
                    <Text style={[styles.lastTestDate, { fontSize: 18, fontWeight: '600' }]}>
                      {latestTest.score}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.riskCardRight}>
                <View style={styles.heartIconContainer}>
                  <Ionicons name="heart" size={24} color={COLORS.white} />
                </View>
                <View style={styles.miniChart}>
                  <View style={[styles.miniChartBar, { height: 15 }]} />
                  <View style={[styles.miniChartBar, { height: 25 }]} />
                  <View style={[styles.miniChartBar, { height: 35 }]} />
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Statistics</Text>
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>Jendo Score History</Text>
              {hasTestData && (
                <View style={styles.trendBadge}>
                  <Ionicons 
                    name={scoreTrend.startsWith('+') ? 'trending-up' : scoreTrend.startsWith('-') ? 'trending-down' : 'remove'} 
                    size={14} 
                    color={scoreTrend.startsWith('+') ? '#4CAF50' : scoreTrend.startsWith('-') ? '#F44336' : COLORS.textMuted} 
                  />
                  <Text style={[styles.trendText, { 
                    color: scoreTrend.startsWith('+') ? '#4CAF50' : scoreTrend.startsWith('-') ? '#F44336' : COLORS.textMuted 
                  }]}>{scoreTrend}</Text>
                </View>
              )}
            </View>
            {hasTestData && scoreHistory.length > 0 ? (
              <JendoScoreChart data={scoreHistory} />
            ) : (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Ionicons name="analytics-outline" size={40} color={COLORS.textMuted} />
                <Text style={{ marginTop: 8, color: COLORS.textMuted, textAlign: 'center' }}>
                  No test history available yet.{'\n'}Take your first Jendo test to see your scores here.
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Health Overview</Text>
          <View style={styles.healthGrid}>
            <View style={styles.healthItem}>
              <View style={styles.healthItemHeader}>
                <Ionicons name="heart-outline" size={16} color={COLORS.primary} />
                <Text style={styles.healthLabel}>Blood Pressure</Text>
              </View>
              <Text style={styles.healthValue}>{dashboardData.healthOverview.bloodPressure.value}</Text>
              <View style={styles.healthStatus}>
                <Ionicons name="pulse-outline" size={12} color="#4CAF50" />
                <Text style={[styles.healthStatusText, { color: '#4CAF50' }]}>{dashboardData.healthOverview.bloodPressure.status}</Text>
              </View>
            </View>

            <View style={styles.healthItem}>
              <View style={styles.healthItemHeader}>
                <Ionicons name="fitness-outline" size={16} color={COLORS.primary} />
                <Text style={styles.healthLabel}>SpO2</Text>
              </View>
              <Text style={styles.healthValue}>{dashboardData.healthOverview.spo2.value}</Text>
              <View style={styles.healthStatus}>
                <Ionicons 
                  name={dashboardData.healthOverview.spo2.status === 'Normal' ? 'checkmark' : 'alert-circle'} 
                  size={12} 
                  color={dashboardData.healthOverview.spo2.color} 
                />
                <Text style={[styles.healthStatusText, { color: dashboardData.healthOverview.spo2.color }]}>
                  {dashboardData.healthOverview.spo2.status}
                </Text>
              </View>
            </View>

            <View style={styles.healthItem}>
              <View style={styles.healthItemHeader}>
                <Ionicons name="body-outline" size={16} color={COLORS.primary} />
                <Text style={styles.healthLabel}>BMI</Text>
              </View>
              <Text style={styles.healthValue}>{dashboardData.healthOverview.bmi.value}</Text>
              <View style={styles.healthStatus}>
                <Ionicons 
                  name={dashboardData.healthOverview.bmi.status === 'Normal' ? 'checkmark' : 'alert-circle'} 
                  size={12} 
                  color={dashboardData.healthOverview.bmi.color} 
                />
                <Text style={[styles.healthStatusText, { color: dashboardData.healthOverview.bmi.color }]}>
                  {dashboardData.healthOverview.bmi.status}
                </Text>
              </View>
            </View>

            <View style={styles.healthItem}>
              <View style={styles.healthItemHeader}>
                <Ionicons name="heart-circle-outline" size={16} color={COLORS.primary} />
                <Text style={styles.healthLabel}>Heart Rate</Text>
              </View>
              <Text style={styles.healthValue}>{dashboardData.healthOverview.heartRate.value}</Text>
              <Text style={styles.healthStatusTextGray}>{dashboardData.healthOverview.heartRate.status}</Text>
            </View>
          </View>
        </View>

        {hasTestData && latestTest && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wellness Suggestions</Text>
            <View style={{
              backgroundColor: COLORS.white,
              borderRadius: 16,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: getRiskColor(dashboardData.riskLevel) + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}>
                  <Ionicons name="fitness" size={20} color={getRiskColor(dashboardData.riskLevel)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary }}>
                    Personalized For You
                  </Text>
                  <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>
                    Based on your {dashboardData.riskLevel.toLowerCase()} risk level
                  </Text>
                </View>
              </View>

              {recommendationsLoading ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={{ marginTop: 8, fontSize: 13, color: COLORS.textSecondary }}>
                    Loading recommendations...
                  </Text>
                </View>
              ) : wellnessRecommendations.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 4, paddingRight: 4 }}
                >
                  {wellnessRecommendations.map((recommendation, index) => {
                    const iconInfo = getCategoryIcon(recommendation.category);
                    return (
                      <TouchableOpacity
                        key={recommendation.id ?? `wellness-${index}`}
                        style={{
                          width: 240,
                          marginRight: 12,
                          backgroundColor: '#F9FAFB',
                          borderRadius: 14,
                          padding: 12,
                          borderWidth: 1,
                          borderColor: '#E5E7EB',
                        }}
                        onPress={() => {}}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <View style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            backgroundColor: iconInfo.color + '15',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 8,
                          }}>
                            <Ionicons name={iconInfo.name} size={16} color={iconInfo.color} />
                          </View>
                          <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.textPrimary }} numberOfLines={1}>
                            {recommendation.category}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.textPrimary }} numberOfLines={2}>
                          {recommendation.title}
                        </Text>
                        <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 6 }} numberOfLines={3}>
                          {recommendation.description}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              ) : (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' }}>
                    No recommendations available at this time.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.reminderCard}>
          <View style={styles.reminderContent}>
            <View style={styles.reminderIcon}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.reminderText}>
              <Text style={styles.reminderTitle}>Test Reminder</Text>
              <Text style={styles.reminderSubtitle}>
                {hasTestData 
                  ? 'Keep up with regular Jendo tests for better health tracking.'
                  : "You haven't done your Jendo test yet. Start now!"}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.chatButton} onPress={() => router.push('/wellness/chatbot')}>
            <Ionicons name="chatbubble-ellipses" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </ScreenWrapper>
  );
};
