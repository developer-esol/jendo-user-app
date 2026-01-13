export type RiskLevel = 'low' | 'moderate' | 'high';

export interface JendoTest {
  id: string;
  userId: string;
  userName?: string;
  testDate: string;
  testTime?: string;
  riskLevel: RiskLevel;
  score: number;
  heartRate?: number;
  bloodPressure?: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  spo2?: number;
  ecgData?: string;
  analysis?: string;
  suggestions?: string[];
  createdAt: string;
}

export interface JendoTestSummary {
  id: string;
  testDate: string;
  riskLevel: RiskLevel;
  score: number;
}

export interface TestStatistics {
  totalTests: number;
  averageScore: number;
  lastTestDate: string;
  riskTrend: 'improving' | 'stable' | 'declining';
  testHistory: {
    date: string;
    score: number;
    riskLevel: RiskLevel;
  }[];
}

export interface RiskIndicator {
  level: RiskLevel;
  label: string;
  description: string;
  color: string;
  backgroundColor: string;
}
