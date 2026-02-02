import { backendApi } from '../../../services/backendApi';
import { ENDPOINTS } from '../../../config/api.config';

// Backend DTO types
export interface JendoTestRequestDto {
  userId: number;
  score?: number;
  heartRate?: number;
  riskLevel?: string;
  testTime?: string; // HH:mm:ss
  bloodPressure?: string; // "120/80"
  spo2?: number;
  testDate?: string; // YYYY-MM-DD
  vascularRisk?: number;
  pdfFilePath?: string;
}

// Combined request for creating test with report in a single call
export interface JendoTestWithReportRequestDto {
  userId: number;
  score?: number;
  heartRate?: number;
  riskLevel?: string;
  testTime?: string; // HH:mm:ss
  bloodPressure?: string; // "120/80"
  spo2?: number;
  testDate?: string; // YYYY-MM-DD
  vascularRisk?: number;
  reportUrl: string; // Required: MinIO URL for the report PDF
  fileName?: string;
  description?: string;
}

// Response DTO for combined test + report creation
export interface JendoTestWithReportResponseDto {
  test: JendoTestResponseDto;
  report: {
    id: number;
    userId: number;
    fileName: string;
    originalFileName: string;
    fileSize: number;
    contentType: string;
    description?: string;
    uploadedAt: string;
    downloadUrl: string;
  };
  message: string;
}

export interface JendoTestResponseDto {
  id: number;
  userId: number;
  userName: string;
  score: number;
  heartRate: number;
  riskLevel: string; // "LOW", "MODERATE", "HIGH"
  testTime: string; // HH:mm:ss
  bloodPressure: string; // "120/80"
  spo2?: number; // Oxygen saturation percentage
  testDate: string; // YYYY-MM-DD
  vascularRisk?: number;
  pdfFilePath?: string;
  createdAt: string; // ISO timestamp
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
  path?: string;
}

interface PaginationResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Frontend Jendo test model
export interface JendoTest {
  id: string;
  userId: string;
  userName: string;
  testDate: string;
  testTime: string;
  riskLevel: 'low' | 'moderate' | 'high';
  score: number;
  heartRate: number;
  bloodPressure: string;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  spo2?: number;
  vascularRisk?: number;
  pdfFilePath?: string;
  createdAt: string;
}

export interface JendoTestSummary {
  id: string;
  testDate: string;
  riskLevel: 'low' | 'moderate' | 'high';
  score: number;
}

// Map backend risk level to frontend
const mapRiskLevel = (level: string): 'low' | 'moderate' | 'high' => {
  switch (level.toUpperCase()) {
    case 'LOW':
      return 'low';
    case 'MODERATE':
      return 'moderate';
    case 'HIGH':
      return 'high';
    default:
      return 'low';
  }
};

// Parse blood pressure string
const parseBloodPressure = (bp: string): { systolic: number; diastolic: number } => {
  const [systolic, diastolic] = bp.split('/').map(Number);
  return { systolic: systolic || 0, diastolic: diastolic || 0 };
};

// Map backend DTO to frontend model
const mapBackendTestToFrontend = (dto: JendoTestResponseDto): JendoTest => {
  const bp = parseBloodPressure(dto.bloodPressure || '0/0');
  const spo2Value = dto.spo2 != null ? Number(dto.spo2) : undefined;
  const vascularRiskValue = dto.vascularRisk != null ? Number(dto.vascularRisk) : undefined;
  return {
    id: dto.id.toString(),
    userId: dto.userId.toString(),
    userName: dto.userName,
    testDate: dto.testDate,
    testTime: dto.testTime || '00:00:00',
    riskLevel: mapRiskLevel(dto.riskLevel),
    score: Number(dto.score) || 0,
    heartRate: Number(dto.heartRate) || 0,
    bloodPressure: dto.bloodPressure || '0/0',
    bloodPressureSystolic: bp.systolic,
    bloodPressureDiastolic: bp.diastolic,
    spo2: spo2Value,
    vascularRisk: vascularRiskValue,
    pdfFilePath: dto.pdfFilePath,
    createdAt: dto.createdAt,
  };
};

export const jendoTestApi = {
  // Get all tests with pagination
  getAllTests: async (page = 0, size = 100): Promise<JendoTest[]> => {
    try {
      console.log('=== Fetching all Jendo tests');
      const response = await backendApi.get<ApiResponse<PaginationResponse<JendoTestResponseDto>>>(
        `${ENDPOINTS.JENDO_TESTS.LIST}?page=${page}&size=${size}`
      );

      if (response.data && response.data.content) {
        return response.data.content.map(mapBackendTestToFrontend);
      }

      return [];
    } catch (error: any) {
      console.error('=== Get all tests error:', error);
      throw new Error(error.message || 'Failed to fetch Jendo tests');
    }
  },

  // Get tests by user ID
  getTestsByUserId: async (userId: number, page = 0, size = 100): Promise<JendoTest[]> => {
    try {
      console.log('=== Fetching Jendo tests for user:', userId);
      const response = await backendApi.get<ApiResponse<PaginationResponse<JendoTestResponseDto>>>(
        `/jendo-tests/user/${userId}?page=${page}&size=${size}`
      );

      if (response.data && response.data.content) {
        return response.data.content.map(mapBackendTestToFrontend);
      }

      return [];
    } catch (error: any) {
      console.error('=== Get user tests error:', error);
      throw new Error(error.message || 'Failed to fetch user tests');
    }
  },

  // Get test by ID
  getTestById: async (id: string): Promise<JendoTest | null> => {
    try {
      console.log('=== Fetching Jendo test:', id);
      const response = await backendApi.get<ApiResponse<JendoTestResponseDto>>(
        ENDPOINTS.JENDO_TESTS.DETAIL(id)
      );

      if (response.data) {
        return mapBackendTestToFrontend(response.data);
      }

      return null;
    } catch (error: any) {
      console.error('=== Get test by ID error:', error);
      throw new Error(error.message || 'Failed to fetch test');
    }
  },

  // Get tests by date range
  getTestsByDateRange: async (
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<JendoTest[]> => {
    try {
      console.log('=== Fetching tests by date range:', { userId, startDate, endDate });
      const response = await backendApi.get<ApiResponse<JendoTestResponseDto[]>>(
        `/jendo-tests/user/${userId}/date-range?startDate=${startDate}&endDate=${endDate}`
      );

      if (response.data) {
        return response.data.map(mapBackendTestToFrontend);
      }

      return [];
    } catch (error: any) {
      console.error('=== Get tests by date range error:', error);
      throw new Error(error.message || 'Failed to fetch tests by date range');
    }
  },

  // Create new test
  createTest: async (data: JendoTestRequestDto): Promise<JendoTest> => {
    try {
      console.log('=== Creating Jendo test:', data);
      const response = await backendApi.post<ApiResponse<JendoTestResponseDto>>(
        ENDPOINTS.JENDO_TESTS.CREATE,
        data
      );

      if (response.data) {
        return mapBackendTestToFrontend(response.data);
      }

      throw new Error('Failed to create test');
    } catch (error: any) {
      console.error('=== Create test error:', error);
      throw new Error(error.message || 'Failed to create test');
    }
  },

  /**
   * Create a Jendo test with report in a single API call
   * This is the preferred method for mobile app - creates both test result and PDF report atomically
   */
  createTestWithReport: async (data: JendoTestWithReportRequestDto): Promise<{
    test: JendoTest;
    report: {
      id: string;
      userId: string;
      fileName: string;
      originalFileName: string;
      fileSize: number;
      contentType: string;
      description?: string;
      uploadedAt: string;
      downloadUrl: string;
    };
    message: string;
  }> => {
    try {
      console.log('=== Creating Jendo test with report:', data);
      const response = await backendApi.post<ApiResponse<JendoTestWithReportResponseDto>>(
        ENDPOINTS.JENDO_TESTS.CREATE_WITH_REPORT,
        data
      );

      if (response.data) {
        return {
          test: mapBackendTestToFrontend(response.data.test),
          report: {
            id: response.data.report.id.toString(),
            userId: response.data.report.userId.toString(),
            fileName: response.data.report.fileName,
            originalFileName: response.data.report.originalFileName,
            fileSize: response.data.report.fileSize,
            contentType: response.data.report.contentType,
            description: response.data.report.description,
            uploadedAt: response.data.report.uploadedAt,
            downloadUrl: response.data.report.downloadUrl,
          },
          message: response.data.message,
        };
      }

      throw new Error('Failed to create test with report');
    } catch (error: any) {
      console.error('=== Create test with report error:', error);
      throw new Error(error.message || 'Failed to create test with report');
    }
  },

  // Update test
  updateTest: async (id: string, data: JendoTestRequestDto): Promise<JendoTest> => {
    try {
      console.log('=== Updating Jendo test:', { id, data });
      const response = await backendApi.put<ApiResponse<JendoTestResponseDto>>(
        `/jendo-tests/${id}`,
        data
      );

      if (response.data) {
        return mapBackendTestToFrontend(response.data);
      }

      throw new Error('Failed to update test');
    } catch (error: any) {
      console.error('=== Update test error:', error);
      throw new Error(error.message || 'Failed to update test');
    }
  },

  // Delete test
  deleteTest: async (id: string): Promise<void> => {
    try {
      console.log('=== Deleting Jendo test:', id);
      await backendApi.delete(`/jendo-tests/${id}`);
    } catch (error: any) {
      console.error('=== Delete test error:', error);
      throw new Error(error.message || 'Failed to delete test');
    }
  },
};
