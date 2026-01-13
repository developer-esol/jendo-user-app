import { JendoTest, RiskLevel, TestStatistics } from '../../../types/models';
import { httpClient } from '../../../infrastructure/api';
import { ENDPOINTS } from '../../../config/api.config';

export interface DashboardData {
  currentRiskLevel: RiskLevel;
  lastTestDate: string;
  lastTestScore: number;
  upcomingAppointment?: {
    doctorName: string;
    date: string;
    type: string;
  };
  healthTips: {
    id: string;
    title: string;
    description: string;
    icon: string;
  }[];
  recentTests: {
    date: string;
    score: number;
    riskLevel: RiskLevel;
  }[];
}

const DUMMY_DASHBOARD_DATA: DashboardData = {
  currentRiskLevel: 'low',
  lastTestDate: '2024-11-15T09:00:00Z',
  lastTestScore: 85,
  upcomingAppointment: {
    doctorName: 'Dr. Sarah Johnson',
    date: '2024-12-10T10:30:00Z',
    type: 'Video Consultation',
  },
  healthTips: [
    { id: 'tip-1', title: 'Stay Hydrated', description: 'Drink at least 8 glasses of water daily for better heart health', icon: 'water-outline' },
    { id: 'tip-2', title: 'Regular Exercise', description: '30 minutes of moderate exercise can improve cardiovascular health', icon: 'fitness-outline' },
    { id: 'tip-3', title: 'Monitor Sleep', description: 'Aim for 7-8 hours of quality sleep each night', icon: 'moon-outline' },
  ],
  recentTests: [
    { date: '2024-11-15', score: 85, riskLevel: 'low' },
    { date: '2024-10-20', score: 78, riskLevel: 'low' },
    { date: '2024-09-18', score: 72, riskLevel: 'moderate' },
    { date: '2024-08-15', score: 68, riskLevel: 'moderate' },
    { date: '2024-07-10', score: 75, riskLevel: 'low' },
  ],
};

const DUMMY_STATISTICS: TestStatistics = {
  totalTests: 12,
  averageScore: 76,
  lastTestDate: '2024-11-15T09:00:00Z',
  riskTrend: 'improving',
  testHistory: [
    { date: '2024-11', score: 85, riskLevel: 'low' },
    { date: '2024-10', score: 78, riskLevel: 'low' },
    { date: '2024-09', score: 72, riskLevel: 'moderate' },
    { date: '2024-08', score: 68, riskLevel: 'moderate' },
    { date: '2024-07', score: 75, riskLevel: 'low' },
    { date: '2024-06', score: 70, riskLevel: 'moderate' },
  ],
};

export const dashboardApi = {
  getDashboardData: async (): Promise<DashboardData> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.get<DashboardData>(ENDPOINTS.DASHBOARD.DATA);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 800));
    return DUMMY_DASHBOARD_DATA;
  },

  getTestStatistics: async (): Promise<TestStatistics> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.get<TestStatistics>(ENDPOINTS.DASHBOARD.STATISTICS);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 600));
    return DUMMY_STATISTICS;
  },

  getQuickActions: async () => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.get<{ id: string; title: string; icon: string; route: string }[]>(ENDPOINTS.DASHBOARD.QUICK_ACTIONS);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { id: 'test', title: 'Take Test', icon: 'pulse-outline', route: '/jendo-tests/new' },
      { id: 'reports', title: 'View Reports', icon: 'document-text-outline', route: '/jendo-reports' },
      { id: 'doctors', title: 'Find Doctor', icon: 'medical-outline', route: '/doctors' },
      { id: 'wellness', title: 'Wellness Tips', icon: 'heart-outline', route: '/wellness' },
    ];
  },
};
