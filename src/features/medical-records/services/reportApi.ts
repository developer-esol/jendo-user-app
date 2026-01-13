import { httpClient } from '../../../infrastructure/api';
import { ENDPOINTS } from '../../../config/api.config';
import { Platform } from 'react-native';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface ReportCategory {
  id: number;
  name: string;
  icon: string | null;
  description: string | null;
  sections?: ReportSection[];
}

export interface ReportSection {
  id: number;
  name: string;
  icon: string | null;
  description: string | null;
  categoryId: number | null;
  categoryName: string | null;
  items?: ReportItem[];
}

export interface ReportItem {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  sectionId: number;
  sectionName: string;
  jendoTestId: number | null;
}

export interface ReportAttachment {
  id: number;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
  reportItemValueId: number;
  downloadUrl: string;
}

export interface ReportItemValue {
  id: number;
  reportItemId: number;
  reportItemName: string;
  userId: number | null;
  valueNumber: number | null;
  valueText: string | null;
  valueDate: string | null;
  createdAt: string;
  updatedAt: string;
  attachments: ReportAttachment[];
}

export interface CreateReportValueRequest {
  reportItemId: number;
  userId?: number;
  valueNumber?: number;
  valueText?: string;
  valueDate?: string;
}

export interface UpdateReportValueRequest {
  reportItemId?: number;
  userId?: number;
  valueNumber?: number;
  valueText?: string;
  valueDate?: string;
}

export const reportApi = {
  getCategories: async (): Promise<ReportCategory[]> => {
    try {
      const response = await httpClient.get<ApiResponse<ReportCategory[]>>(
        ENDPOINTS.REPORTS.CATEGORIES
      );
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      throw new Error(error.message || 'Failed to fetch categories');
    }
  },

  getCategoryById: async (id: number): Promise<ReportCategory> => {
    try {
      const response = await httpClient.get<ApiResponse<ReportCategory>>(
        ENDPOINTS.REPORTS.CATEGORY_DETAIL(id)
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching category:', error);
      throw new Error(error.message || 'Failed to fetch category');
    }
  },

  getCategoryWithSections: async (id: number): Promise<ReportCategory> => {
    try {
      const response = await httpClient.get<ApiResponse<ReportCategory>>(
        ENDPOINTS.REPORTS.CATEGORY_WITH_SECTIONS(id)
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching category with sections:', error);
      throw new Error(error.message || 'Failed to fetch category with sections');
    }
  },

  getSectionsByCategory: async (categoryId: number): Promise<ReportSection[]> => {
    try {
      const response = await httpClient.get<ApiResponse<ReportSection[]>>(
        ENDPOINTS.REPORTS.SECTIONS_BY_CATEGORY(categoryId)
      );
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching sections:', error);
      throw new Error(error.message || 'Failed to fetch sections');
    }
  },

  getSectionWithItems: async (sectionId: number): Promise<ReportSection> => {
    try {
      const response = await httpClient.get<ApiResponse<ReportSection>>(
        ENDPOINTS.REPORTS.SECTION_WITH_ITEMS(sectionId)
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching section with items:', error);
      throw new Error(error.message || 'Failed to fetch section with items');
    }
  },

  getItemsBySection: async (sectionId: number): Promise<ReportItem[]> => {
    try {
      const response = await httpClient.get<ApiResponse<ReportItem[]>>(
        ENDPOINTS.REPORTS.ITEMS_BY_SECTION(sectionId)
      );
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching items:', error);
      throw new Error(error.message || 'Failed to fetch items');
    }
  },

  getValuesByUser: async (userId: number): Promise<ReportItemValue[]> => {
    try {
      const response = await httpClient.get<ApiResponse<ReportItemValue[]>>(
        ENDPOINTS.REPORTS.VALUES_BY_USER(userId)
      );
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching user values:', error);
      throw new Error(error.message || 'Failed to fetch user values');
    }
  },

  getValuesByItem: async (itemId: number): Promise<ReportItemValue[]> => {
    try {
      const response = await httpClient.get<ApiResponse<ReportItemValue[]>>(
        ENDPOINTS.REPORTS.VALUES_BY_ITEM(itemId)
      );
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching item values:', error);
      throw new Error(error.message || 'Failed to fetch item values');
    }
  },

  getValuesByUserAndItem: async (userId: number, itemId: number): Promise<ReportItemValue[]> => {
    try {
      const response = await httpClient.get<ApiResponse<ReportItemValue[]>>(
        ENDPOINTS.REPORTS.VALUES_BY_USER_AND_ITEM(userId, itemId)
      );
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching values:', error);
      throw new Error(error.message || 'Failed to fetch values');
    }
  },

  createValue: async (data: CreateReportValueRequest): Promise<ReportItemValue> => {
    try {
      const response = await httpClient.post<ApiResponse<ReportItemValue>>(
        ENDPOINTS.REPORTS.VALUES,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating value:', error);
      throw new Error(error.message || 'Failed to create value');
    }
  },

  updateValue: async (id: number, data: UpdateReportValueRequest): Promise<ReportItemValue> => {
    try {
      const response = await httpClient.put<ApiResponse<ReportItemValue>>(
        ENDPOINTS.REPORTS.VALUE_DETAIL(id),
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating value:', error);
      throw new Error(error.message || 'Failed to update value');
    }
  },

  deleteValue: async (id: number): Promise<void> => {
    try {
      await httpClient.delete(ENDPOINTS.REPORTS.VALUE_DETAIL(id));
    } catch (error: any) {
      console.error('Error deleting value:', error);
      throw new Error(error.message || 'Failed to delete value');
    }
  },

  uploadAttachment: async (valueId: number, file: any): Promise<ReportItemValue> => {
    try {
      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        formData.append('file', file);
      } else {
        formData.append('file', {
          uri: file.uri,
          type: file.type || 'application/octet-stream',
          name: file.name || 'attachment',
        } as any);
      }

      const response = await httpClient.post<ApiResponse<ReportItemValue>>(
        ENDPOINTS.REPORTS.VALUE_ATTACHMENTS(valueId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error uploading attachment:', error);
      throw new Error(error.message || 'Failed to upload attachment');
    }
  },

  deleteAttachment: async (attachmentId: number): Promise<void> => {
    try {
      await httpClient.delete(ENDPOINTS.REPORTS.DELETE_ATTACHMENT(attachmentId));
    } catch (error: any) {
      console.error('Error deleting attachment:', error);
      throw new Error(error.message || 'Failed to delete attachment');
    }
  },

  getAttachmentDownloadUrl: (attachmentId: number): string => {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || '/api';
    return `${baseUrl}${ENDPOINTS.REPORTS.ATTACHMENT_DOWNLOAD(attachmentId)}`;
  },
};
