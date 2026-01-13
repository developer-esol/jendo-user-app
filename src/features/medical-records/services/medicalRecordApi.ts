import { MedicalFolder, MedicalRecord, IllnessCategory, Attachment } from '../../../types/models';
import { httpClient } from '../../../infrastructure/api';
import { ENDPOINTS } from '../../../config/api.config';

const DUMMY_FOLDERS: MedicalFolder[] = [
  { id: 'folder-001', name: 'Diabetes', category: 'diabetes', icon: 'water', color: '#4CAF50', recordCount: 5, lastUpdated: '2024-11-10T14:30:00Z' },
  { id: 'folder-002', name: 'Cardiovascular', category: 'cardiovascular', icon: 'heart', color: '#F44336', recordCount: 8, lastUpdated: '2024-11-15T09:00:00Z' },
  { id: 'folder-003', name: 'Pregnancy', category: 'pregnancy', icon: 'woman', color: '#E91E63', recordCount: 0, lastUpdated: undefined },
  { id: 'folder-004', name: 'Respiratory', category: 'respiratory', icon: 'cloud', color: '#2196F3', recordCount: 3, lastUpdated: '2024-10-25T11:00:00Z' },
  { id: 'folder-005', name: 'Allergies', category: 'allergy', icon: 'flower', color: '#FF9800', recordCount: 2, lastUpdated: '2024-09-15T16:00:00Z' },
  { id: 'folder-006', name: 'General', category: 'general', icon: 'document', color: '#607D8B', recordCount: 12, lastUpdated: '2024-11-18T10:30:00Z' },
];

const DUMMY_RECORDS: MedicalRecord[] = [
  {
    id: 'record-001',
    userId: 'user-001',
    folderId: 'folder-002',
    category: 'cardiovascular',
    title: 'Annual Heart Checkup',
    description: 'Comprehensive cardiovascular examination',
    date: '2024-11-15',
    doctorName: 'Dr. Sarah Johnson',
    hospitalName: 'National Hospital, Colombo',
    diagnosis: 'Normal sinus rhythm. No abnormalities detected.',
    prescription: 'Continue current medications. Follow-up in 6 months.',
    notes: 'All test results within normal range.',
    attachments: [{ id: 'att-001', type: 'pdf', name: 'ECG_Report_Nov2024.pdf', url: 'https://example.com/documents/ecg-report.pdf', size: 245000, uploadedAt: '2024-11-15T09:30:00Z' }],
    createdAt: '2024-11-15T09:00:00Z',
    updatedAt: '2024-11-15T09:30:00Z',
  },
  {
    id: 'record-002',
    userId: 'user-001',
    folderId: 'folder-001',
    category: 'diabetes',
    title: 'Blood Sugar Test',
    description: 'Quarterly diabetes monitoring',
    date: '2024-11-10',
    doctorName: 'Dr. Michael Chen',
    hospitalName: 'Lanka Hospitals',
    diagnosis: 'HbA1c levels within target range (6.2%)',
    prescription: 'Metformin 500mg twice daily',
    notes: 'Good glycemic control.',
    attachments: [{ id: 'att-002', type: 'pdf', name: 'Lab_Results_Nov2024.pdf', url: 'https://example.com/documents/lab-results.pdf', size: 156000, uploadedAt: '2024-11-10T15:00:00Z' }],
    createdAt: '2024-11-10T14:30:00Z',
    updatedAt: '2024-11-10T15:00:00Z',
  },
];

export const medicalRecordApi = {
  getFolders: async (): Promise<MedicalFolder[]> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.get<MedicalFolder[]>(ENDPOINTS.MEDICAL_RECORDS.FOLDERS);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 600));
    return DUMMY_FOLDERS;
  },

  getFolderById: async (id: string): Promise<MedicalFolder | null> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.get<MedicalFolder>(ENDPOINTS.MEDICAL_RECORDS.FOLDER_DETAIL(id));

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 400));
    return DUMMY_FOLDERS.find(folder => folder.id === id) || null;
  },

  getRecordsByFolder: async (folderId: string): Promise<MedicalRecord[]> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.get<MedicalRecord[]>(ENDPOINTS.MEDICAL_RECORDS.RECORDS_BY_FOLDER(folderId));

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 700));
    return DUMMY_RECORDS.filter(record => record.folderId === folderId);
  },

  getRecordById: async (id: string): Promise<MedicalRecord | null> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.get<MedicalRecord>(ENDPOINTS.MEDICAL_RECORDS.RECORD_DETAIL(id));

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 500));
    return DUMMY_RECORDS.find(record => record.id === id) || null;
  },

  getAllRecords: async (): Promise<MedicalRecord[]> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.get<MedicalRecord[]>(ENDPOINTS.MEDICAL_RECORDS.RECORDS);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 800));
    return DUMMY_RECORDS;
  },

  createRecord: async (data: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.post<MedicalRecord>(ENDPOINTS.MEDICAL_RECORDS.CREATE, data);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newRecord: MedicalRecord = {
      id: `record-${Date.now()}`,
      userId: 'user-001',
      folderId: data.folderId || 'folder-006',
      category: data.category || 'general',
      title: data.title || 'New Record',
      description: data.description,
      date: data.date || new Date().toISOString().split('T')[0],
      doctorName: data.doctorName,
      hospitalName: data.hospitalName,
      diagnosis: data.diagnosis,
      prescription: data.prescription,
      notes: data.notes,
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newRecord;
  },

  updateRecord: async (id: string, data: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.put<MedicalRecord>(ENDPOINTS.MEDICAL_RECORDS.UPDATE(id), data);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 800));
    const existingRecord = DUMMY_RECORDS.find(r => r.id === id);
    if (!existingRecord) throw new Error('Record not found');
    return { ...existingRecord, ...data, updatedAt: new Date().toISOString() };
  },

  deleteRecord: async (id: string): Promise<void> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.delete<void>(ENDPOINTS.MEDICAL_RECORDS.DELETE(id));

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  searchRecords: async (query: string): Promise<MedicalRecord[]> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.get<MedicalRecord[]>(`${ENDPOINTS.MEDICAL_RECORDS.SEARCH}?q=${encodeURIComponent(query)}`);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 600));
    const lowercaseQuery = query.toLowerCase();
    return DUMMY_RECORDS.filter(record =>
      record.title.toLowerCase().includes(lowercaseQuery) ||
      record.doctorName?.toLowerCase().includes(lowercaseQuery) ||
      record.hospitalName?.toLowerCase().includes(lowercaseQuery) ||
      record.diagnosis?.toLowerCase().includes(lowercaseQuery)
    );
  },
};
