import { WellnessTip, LearningMaterial, WellnessCategory, ChatMessage, WellnessRecommendation } from '../../../types/models';
import { httpClient } from '../../../infrastructure/api';
import { ENDPOINTS } from '../../../config/api.config';

const DUMMY_WELLNESS_TIPS: WellnessTip[] = [
  { id: 'tip-001', category: 'diet', title: 'Heart-Healthy Diet Basics', description: 'Focus on fruits, vegetables, whole grains, and lean proteins.', content: 'A heart-healthy diet emphasizes plant-based foods, limits saturated fats, and includes omega-3 rich fish.', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', riskLevel: 'all', createdAt: '2024-11-01T00:00:00Z' },
  { id: 'tip-002', category: 'exercise', title: 'Walking for Heart Health', description: 'Just 30 minutes of brisk walking daily can significantly improve cardiovascular fitness.', content: 'Aim for at least 150 minutes of moderate aerobic activity per week.', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', riskLevel: 'low', createdAt: '2024-11-02T00:00:00Z' },
  { id: 'tip-003', category: 'sleep', title: 'Quality Sleep Matters', description: 'Poor sleep is linked to higher cardiovascular risk. Aim for 7-8 hours.', content: 'Establish a consistent sleep schedule and create a relaxing bedtime routine.', imageUrl: 'https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=400', riskLevel: 'all', createdAt: '2024-11-03T00:00:00Z' },
  { id: 'tip-004', category: 'stress', title: 'Managing Stress Effectively', description: 'Chronic stress can damage your heart. Learn techniques to manage stress daily.', content: 'Practice deep breathing exercises, meditation, or yoga.', imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400', riskLevel: 'moderate', createdAt: '2024-11-04T00:00:00Z' },
  { id: 'tip-005', category: 'diet', title: 'Reduce Salt Intake', description: 'High sodium consumption is a major risk factor for high blood pressure.', content: 'Use herbs and spices instead of salt. Read food labels and choose low-sodium options.', imageUrl: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400', riskLevel: 'high', createdAt: '2024-11-05T00:00:00Z' },
];

const DUMMY_LEARNING_MATERIALS: LearningMaterial[] = [
  { id: 'learn-001', type: 'article', category: 'general', title: 'Understanding Your Heart', description: 'A comprehensive guide to how your heart works.', content: 'Your heart beats about 100,000 times a day...', thumbnailUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400', author: 'Dr. Sarah Johnson', publishedAt: '2024-10-15T00:00:00Z', viewCount: 1250, isFeatured: true },
  { id: 'learn-002', type: 'video', category: 'exercise', title: 'Beginner Cardio Workout', description: 'A 15-minute low-impact cardio routine.', thumbnailUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', videoUrl: 'https://example.com/videos/cardio-workout.mp4', duration: 15, author: 'Fitness Team', publishedAt: '2024-10-20T00:00:00Z', viewCount: 3420, isFeatured: true },
  { id: 'learn-003', type: 'tutorial', category: 'diet', title: 'Heart-Healthy Meal Prep', description: 'Step-by-step guide to preparing nutritious meals.', thumbnailUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400', author: 'Nutrition Team', publishedAt: '2024-10-25T00:00:00Z', viewCount: 2100, isFeatured: false },
  { id: 'learn-004', type: 'article', category: 'stress', title: 'Meditation for Heart Health', description: 'How regular meditation practice can improve cardiovascular health.', content: 'Research shows that meditation can lower blood pressure...', thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', author: 'Dr. James Wilson', publishedAt: '2024-11-01T00:00:00Z', viewCount: 890, isFeatured: false },
  { id: 'learn-005', type: 'video', category: 'sleep', title: 'Relaxation Techniques for Better Sleep', description: 'Guided relaxation exercises.', thumbnailUrl: 'https://images.unsplash.com/photo-1531353826977-0941b4779a1c?w=400', videoUrl: 'https://example.com/videos/sleep-relaxation.mp4', duration: 20, author: 'Wellness Team', publishedAt: '2024-11-05T00:00:00Z', viewCount: 1560, isFeatured: true },
];

const DUMMY_RECOMMENDATIONS: WellnessRecommendation[] = [
  { id: 'rec-001', category: 'diet', title: 'Eat More Omega-3', description: 'Include fatty fish, walnuts, and flaxseed in your diet', icon: 'fish-outline', priority: 1 },
  { id: 'rec-002', category: 'exercise', title: 'Daily Walking', description: 'Aim for 10,000 steps or 30 minutes of walking', icon: 'walk-outline', priority: 2 },
  { id: 'rec-003', category: 'sleep', title: 'Consistent Sleep Schedule', description: 'Go to bed and wake up at the same time daily', icon: 'bed-outline', priority: 3 },
  { id: 'rec-004', category: 'stress', title: 'Practice Deep Breathing', description: 'Take 5 minutes for breathing exercises twice daily', icon: 'leaf-outline', priority: 4 },
];

export const wellnessApi = {
  getTips: async (category?: WellnessCategory): Promise<WellnessTip[]> => {
    // REAL API - Uncomment when backend is ready
    // if (category) {
    //   return httpClient.get<WellnessTip[]>(ENDPOINTS.WELLNESS.TIPS_BY_CATEGORY(category));
    // }
    // return httpClient.get<WellnessTip[]>(ENDPOINTS.WELLNESS.TIPS);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 600));
    if (category) {
      return DUMMY_WELLNESS_TIPS.filter(tip => tip.category === category);
    }
    return DUMMY_WELLNESS_TIPS;
  },

  getTipById: async (id: string): Promise<WellnessTip | null> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.get<WellnessTip>(ENDPOINTS.WELLNESS.TIP_DETAIL(id));

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 400));
    return DUMMY_WELLNESS_TIPS.find(tip => tip.id === id) || null;
  },

  getLearningMaterials: async (category?: WellnessCategory): Promise<LearningMaterial[]> => {
    // REAL API - Uncomment when backend is ready
    // const url = category ? `${ENDPOINTS.WELLNESS.LEARNING_MATERIALS}?category=${category}` : ENDPOINTS.WELLNESS.LEARNING_MATERIALS;
    // return httpClient.get<LearningMaterial[]>(url);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 700));
    if (category) {
      return DUMMY_LEARNING_MATERIALS.filter(mat => mat.category === category);
    }
    return DUMMY_LEARNING_MATERIALS;
  },

  getFeaturedMaterials: async (): Promise<LearningMaterial[]> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.get<LearningMaterial[]>(ENDPOINTS.WELLNESS.FEATURED_MATERIALS);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 500));
    return DUMMY_LEARNING_MATERIALS.filter(mat => mat.isFeatured);
  },

  getMaterialById: async (id: string): Promise<LearningMaterial | null> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.get<LearningMaterial>(ENDPOINTS.WELLNESS.LEARNING_MATERIAL_DETAIL(id));

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 400));
    return DUMMY_LEARNING_MATERIALS.find(mat => mat.id === id) || null;
  },

  getRecommendations: async (riskLevel?: string): Promise<WellnessRecommendation[]> => {
    // REAL API - Uncomment when backend is ready
    // const url = riskLevel ? `${ENDPOINTS.WELLNESS.RECOMMENDATIONS}?riskLevel=${riskLevel}` : ENDPOINTS.WELLNESS.RECOMMENDATIONS;
    // return httpClient.get<WellnessRecommendation[]>(url);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 500));
    return DUMMY_RECOMMENDATIONS;
  },

  sendChatMessage: async (message: string, history?: { role: string; content: string }[]): Promise<ChatMessage> => {
    try {
      const response = await httpClient.post<ChatMessage>(ENDPOINTS.WELLNESS.CHAT, { 
        message,
        history: history || []
      });
      return response;
    } catch (error) {
      console.error('Chat API error:', error);
      return {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I apologize, but I'm having trouble responding right now. Please try again later.",
        timestamp: new Date().toISOString(),
      };
    }
  },
};
