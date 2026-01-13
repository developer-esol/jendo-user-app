import { UserProfile, HealthParameters } from '../../../types/models';
import { httpClient } from '../../../infrastructure/api';
import { ENDPOINTS } from '../../../config/api.config';

const DUMMY_USER_PROFILE: UserProfile = {
  id: 'user-001',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+94 77 123 4567',
  gender: 'male',
  dateOfBirth: '1985-06-15',
  address: '123 Health Street, Colombo 05, Sri Lanka',
  nationality: 'Sri Lankan',
  profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-11-20T14:45:00Z',
  healthParameters: {
    height: 175,
    weight: 72,
    bmi: 23.5,
    bloodType: 'O+',
    allergies: ['Penicillin'],
    chronicConditions: ['None'],
  },
  riskLevel: 'low',
  lastTestDate: '2024-11-15T09:00:00Z',
};

export const profileApi = {
  getProfile: async (): Promise<UserProfile> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.get<UserProfile>(ENDPOINTS.USER.PROFILE);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 600));
    return DUMMY_USER_PROFILE;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.put<UserProfile>(ENDPOINTS.USER.UPDATE_PROFILE, data);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 800));
    return { ...DUMMY_USER_PROFILE, ...data, updatedAt: new Date().toISOString() };
  },

  updateHealthParameters: async (data: Partial<HealthParameters>): Promise<HealthParameters> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.put<HealthParameters>(ENDPOINTS.USER.HEALTH_PARAMETERS, data);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 700));
    const updatedParams = { ...DUMMY_USER_PROFILE.healthParameters, ...data };
    if (updatedParams.height && updatedParams.weight) {
      const heightInMeters = updatedParams.height / 100;
      updatedParams.bmi = Math.round((updatedParams.weight / (heightInMeters * heightInMeters)) * 10) / 10;
    }
    return updatedParams as HealthParameters;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.post<{ success: boolean; message: string }>(ENDPOINTS.USER.CHANGE_PASSWORD, { currentPassword, newPassword });

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (currentPassword === 'password123') {
      return { success: true, message: 'Password changed successfully' };
    }
    throw new Error('Current password is incorrect');
  },

  uploadProfileImage: async (imageUri: string): Promise<{ success: boolean; message: string; data: UserProfile }> => {
    // REAL API - Upload image to backend
    try {
      const formData = new FormData();
      
      // Extract filename from URI
      const filename = imageUri.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      // Append image file
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);

      const response = await httpClient.post<{ success: boolean; message: string; data: UserProfile }>(
        ENDPOINTS.USER.UPLOAD_IMAGE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  deleteAccount: async (): Promise<{ success: boolean; message: string }> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.delete<{ success: boolean; message: string }>(ENDPOINTS.USER.DELETE_ACCOUNT);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'Account deletion request submitted' };
  },

  getHealthSummary: async () => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.get<{ currentRiskLevel: string; totalTests: number; lastTestDate: string; averageScore: number; improvementRate: number; nextTestRecommended: string }>(ENDPOINTS.USER.HEALTH_SUMMARY);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      currentRiskLevel: 'low' as const,
      totalTests: 12,
      lastTestDate: '2024-11-15T09:00:00Z',
      averageScore: 76,
      improvementRate: 15,
      nextTestRecommended: '2024-12-15',
    };
  },
};
