export type LearningMaterialType = 'VIDEO' | 'ARTICLE' | 'PODCAST' | 'PDF';

export interface LearningMaterial {
  id: number;
  title: string;
  author: string;
  duration: string;
  description: string;
  type: LearningMaterialType;
  videoUrl?: string;
  category: string;
  createdAt: string;
}

export interface LearningMaterialsResponse {
  content: LearningMaterial[];
  totalPages: number;
  totalElements: number;
  pageSize: number;
  pageNumber: number;
  first: boolean;
  last: boolean;
}

export type LearningMaterialCategory = 
  | 'All'
  | 'Cardiology'
  | 'Nutrition' 
  | 'Exercise'
  | 'Mental Health'
  | 'General Health';
