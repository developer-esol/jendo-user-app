import { API_ENDPOINTS, httpClient } from '../../../infrastructure/api';

export interface WellnessRecommendation {
  id?: number | string | null;
  title: string;
  description: string;
  longDescription?: string | null;
  category: string;
  riskLevel: string;
  type?: string | null;
  priority: number;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface DailyAiTipsResponse {
  sleep?: WellnessRecommendation[];
  stress?: WellnessRecommendation[];
  exercise?: WellnessRecommendation[];
  diet?: WellnessRecommendation[];
  [key: string]: WellnessRecommendation[] | undefined;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp?: string;
}

export const wellnessRecommendationApi = {
  getByRiskLevel: async (riskLevel: string): Promise<WellnessRecommendation[]> => {
    try {
      const response = await httpClient.get<ApiResponse<WellnessRecommendation[]>>(
        API_ENDPOINTS.WELLNESS.BY_RISK_LEVEL(riskLevel.toUpperCase())
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching wellness recommendations:', error);
      return [];
    }
  },

  getForUser: async (userId: number): Promise<WellnessRecommendation[]> => {
    try {
      const response = await httpClient.get<ApiResponse<WellnessRecommendation[]>>(
        API_ENDPOINTS.WELLNESS.FOR_USER(userId)
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching user wellness recommendations:', error);
      return [];
    }
  },

  getDailyAiTipsForUser: async (userId: number): Promise<DailyAiTipsResponse | null> => {
    try {
      const response = await httpClient.get<ApiResponse<DailyAiTipsResponse>>(
        API_ENDPOINTS.WELLNESS.DAILY_AI_TIPS(userId)
      );
      return response.data || null;
    } catch (error) {
      console.error('Error fetching daily AI tips for user:', error);
      return null;
    }
  },
};
