import { httpClient } from '../../../infrastructure/api/httpClient';
import { ENDPOINTS } from '../../../config/api.config';
import { LearningMaterial, LearningMaterialsResponse } from '../types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

export const learningApi = {
  getAllMaterials: async (page: number = 0, size: number = 10) => {
    const response = await httpClient.get<ApiResponse<LearningMaterialsResponse>>(
      `${ENDPOINTS.WELLNESS.LEARNING_MATERIALS}?page=${page}&size=${size}`
    );
    return response.data;
  },

  getMaterialById: async (id: number) => {
    const response = await httpClient.get<ApiResponse<LearningMaterial>>(
      ENDPOINTS.WELLNESS.LEARNING_MATERIAL_DETAIL(id.toString())
    );
    return response.data;
  },

  getMaterialsByCategory: async (category: string, page: number = 0, size: number = 10) => {
    const response = await httpClient.get<ApiResponse<LearningMaterialsResponse>>(
      `/learning-materials/category/${category}?page=${page}&size=${size}`
    );
    return response.data;
  },

  searchMaterials: async (query: string, page: number = 0, size: number = 10) => {
    const response = await httpClient.get<ApiResponse<LearningMaterialsResponse>>(
      `/learning-materials/search?query=${query}&page=${page}&size=${size}`
    );
    return response.data;
  },

  getFeaturedMaterials: async () => {
    const response = await httpClient.get<ApiResponse<LearningMaterialsResponse>>(
      ENDPOINTS.WELLNESS.FEATURED_MATERIALS
    );
    return response.data;
  },
};
