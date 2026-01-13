export type WellnessCategory = 'diet' | 'exercise' | 'sleep' | 'stress' | 'general';
export type ContentType = 'article' | 'video' | 'tutorial' | 'tip';

export interface WellnessTip {
  id: string;
  category: WellnessCategory;
  title: string;
  description: string;
  content?: string;
  imageUrl?: string;
  riskLevel?: 'low' | 'moderate' | 'high' | 'all';
  createdAt: string;
}

export interface LearningMaterial {
  id: string;
  type: ContentType;
  category: WellnessCategory;
  title: string;
  description: string;
  content?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  duration?: number;
  author: string;
  publishedAt: string;
  viewCount: number;
  isFeatured: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface WellnessRecommendation {
  id: string;
  category: WellnessCategory;
  title: string;
  description: string;
  icon: string;
  priority: number;
}
