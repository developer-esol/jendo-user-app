import { httpClient } from '../../../infrastructure/api';
import { ENDPOINTS } from '../../../config/api.config';

// Backend DTO types for Jendo Reports
export interface JendoReportResponseDto {
  id: number;
  userId: number;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  contentType: string;
  description?: string;
  uploadedAt: string; // ISO timestamp
  downloadUrl: string;
}

// Request DTO for creating a Jendo report with MinIO URL
export interface JendoReportCreateRequest {
  userId: number;
  reportUrl: string;
  fileName?: string;
  description?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
  path?: string;
}

// Frontend Jendo report model
export interface JendoReport {
  id: string;
  userId: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  contentType: string;
  description?: string;
  uploadedAt: string;
  downloadUrl: string;
}

/**
 * Maps backend JendoReportResponseDto to frontend JendoReport model
 */
const mapBackendReportToFrontend = (dto: JendoReportResponseDto): JendoReport => {
  return {
    id: String(dto.id),
    userId: String(dto.userId),
    fileName: dto.fileName,
    originalFileName: dto.originalFileName,
    fileSize: dto.fileSize,
    contentType: dto.contentType,
    description: dto.description,
    uploadedAt: dto.uploadedAt,
    downloadUrl: dto.downloadUrl,
  };
};

export const jendoReportApi = {
  /**
   * Get all Jendo reports for a specific user
   */
  getReportsByUserId: async (userId: number): Promise<JendoReport[]> => {
    try {
      console.log('=== Fetching Jendo reports for user:', userId);
      const response = await httpClient.get<ApiResponse<JendoReportResponseDto[]>>(
        ENDPOINTS.JENDO_REPORTS.BY_USER(userId)
      );

      if (response.data && Array.isArray(response.data)) {
        return response.data.map(mapBackendReportToFrontend);
      }

      return [];
    } catch (error: any) {
      console.error('=== Get reports by user error:', error);
      throw new Error(error.message || 'Failed to fetch Jendo reports');
    }
  },

  /**
   * Get a single Jendo report by ID
   */
  getReportById: async (id: string): Promise<JendoReport | null> => {
    try {
      console.log('=== Fetching Jendo report:', id);
      const response = await httpClient.get<ApiResponse<JendoReportResponseDto>>(
        ENDPOINTS.JENDO_REPORTS.DETAIL(id)
      );

      if (response.data) {
        return mapBackendReportToFrontend(response.data);
      }

      return null;
    } catch (error: any) {
      console.error('=== Get report by ID error:', error);
      throw new Error(error.message || 'Failed to fetch Jendo report');
    }
  },

  /**
   * Create a Jendo report with a MinIO URL
   */
  createReport: async (request: JendoReportCreateRequest): Promise<JendoReport> => {
    try {
      console.log('=== Creating Jendo report for user:', request.userId);
      const response = await httpClient.post<ApiResponse<JendoReportResponseDto>>(
        ENDPOINTS.JENDO_REPORTS.CREATE,
        request
      );

      if (response.data) {
        console.log('=== Report created successfully');
        return mapBackendReportToFrontend(response.data);
      }

      throw new Error('Failed to create Jendo report');
    } catch (error: any) {
      console.error('=== Create report error:', error);
      throw new Error(error.message || 'Failed to create Jendo report');
    }
  },

  /**
   * Get the download URL for a report
   */
  getDownloadUrl: (reportId: string): string => {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || '/api';
    return `${baseUrl}/jendo-reports/${reportId}/download`;
  },

  /**   * Download a Jendo report file with authentication
   */
  downloadReport: async (reportId: string, fileName: string): Promise<void> => {
    try {
      console.log('=== Downloading Jendo report:', reportId);
      const { backendApi } = await import('../../../services/backendApi');
      
      // Download file as blob with authentication
      const blob = await backendApi.downloadFile(
        ENDPOINTS.JENDO_REPORTS.DOWNLOAD(reportId)
      );

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('=== Report downloaded successfully');
    } catch (error: any) {
      console.error('=== Download report error:', error);
      throw new Error(error.message || 'Failed to download Jendo report');
    }
  },

  /**   * Delete a Jendo report
   */
  deleteReport: async (id: string): Promise<void> => {
    try {
      console.log('=== Deleting Jendo report:', id);
      await httpClient.delete<ApiResponse<void>>(
        ENDPOINTS.JENDO_REPORTS.DELETE(id)
      );
      console.log('=== Report deleted successfully');
    } catch (error: any) {
      console.error('=== Delete report error:', error);
      throw new Error(error.message || 'Failed to delete Jendo report');
    }
  },
};
