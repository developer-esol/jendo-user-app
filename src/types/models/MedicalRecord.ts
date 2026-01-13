export type IllnessCategory = 
  | 'diabetes'
  | 'cardiovascular'
  | 'pregnancy'
  | 'respiratory'
  | 'allergy'
  | 'general'
  | 'other';

export interface MedicalFolder {
  id: string;
  name: string;
  category: IllnessCategory;
  icon: string;
  color: string;
  recordCount: number;
  lastUpdated?: string;
}

export interface MedicalRecord {
  id: string;
  userId: string;
  folderId: string;
  category: IllnessCategory;
  title: string;
  description?: string;
  date: string;
  doctorName?: string;
  hospitalName?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'pdf' | 'document';
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export interface MedicalRecordForm {
  title: string;
  category: IllnessCategory;
  date: string;
  doctorName?: string;
  hospitalName?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  attachments?: File[];
}
