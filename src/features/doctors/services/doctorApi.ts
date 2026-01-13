import { Doctor, DoctorSummary, DoctorSpecialty, Appointment, TimeSlot, AppointmentType } from '../../../types/models';
import { httpClient } from '../../../infrastructure/api';
import { ENDPOINTS } from '../../../config/api.config';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
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

interface DoctorBackendDto {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  email?: string;
  phone?: string;
  qualifications?: string;
  imageUrl?: string;
  address?: string;
  isAvailable?: boolean;
  availableDays?: string;
  consultationFees?: Array<{
    id: number;
    feeType: string;
    amount: number;
    currency: string;
  }>;
}

const mapBackendDoctorToDoctor = (backendDoctor: DoctorBackendDto): Doctor => {
  const qualifications = backendDoctor.qualifications 
    ? backendDoctor.qualifications.split(',').map(q => q.trim())
    : [];
  
  const availableDays = backendDoctor.availableDays
    ? backendDoctor.availableDays.split(',').map(d => d.trim())
    : [];
  
  const consultationFee = backendDoctor.consultationFees && backendDoctor.consultationFees.length > 0
    ? Number(backendDoctor.consultationFees[0].amount)
    : 0;

  const consultationFees = backendDoctor.consultationFees?.reduce((acc, fee) => {
    acc[fee.feeType.toLowerCase()] = Number(fee.amount);
    return acc;
  }, {} as Record<string, number>) || {};

  return {
    id: String(backendDoctor.id),
    name: backendDoctor.name,
    specialty: mapBackendSpecialtyToFrontend(backendDoctor.specialty),
    hospital: backendDoctor.hospital,
    experience: 0,
    rating: 4.5,
    reviewCount: 0,
    imageUrl: backendDoctor.imageUrl,
    about: '',
    qualifications,
    availableDays,
    consultationFee,
    consultationFees,
    isAvailable: backendDoctor.isAvailable ?? true,
    phone: backendDoctor.phone,
    email: backendDoctor.email,
  };
};

const mapBackendDoctorToSummary = (backendDoctor: DoctorBackendDto): DoctorSummary => {
  return {
    id: String(backendDoctor.id),
    name: backendDoctor.name,
    specialty: mapBackendSpecialtyToFrontend(backendDoctor.specialty),
    hospital: backendDoctor.hospital,
    rating: 4.5,
    imageUrl: backendDoctor.imageUrl,
    isAvailable: backendDoctor.isAvailable ?? true,
  };
};

const mapBackendSpecialtyToFrontend = (specialty: string | null | undefined): DoctorSpecialty => {
  if (!specialty) return 'general';
  const normalized = specialty.toLowerCase().trim();
  
  const specialtyMap: Record<string, DoctorSpecialty> = {
    'cardiology': 'cardiologist',
    'cardiologist': 'cardiologist',
    'neurology': 'neurologist',
    'neurologist': 'neurologist',
    'dermatology': 'dermatologist',
    'dermatologist': 'dermatologist',
    'pediatrics': 'pediatrician',
    'pediatrician': 'pediatrician',
    'orthopedics': 'orthopedic',
    'orthopedic': 'orthopedic',
    'gynecology': 'gynecologist',
    'gynecologist': 'gynecologist',
    'ophthalmology': 'ophthalmologist',
    'ophthalmologist': 'ophthalmologist',
    'psychiatry': 'psychiatrist',
    'psychiatrist': 'psychiatrist',
    'endocrinology': 'endocrinologist',
    'endocrinologist': 'endocrinologist',
    'general': 'general',
    'general practitioner': 'general',
  };
  
  return specialtyMap[normalized] || 'general';
};

export const doctorApi = {
  getAllDoctors: async (page: number = 0, size: number = 10): Promise<{ doctors: DoctorSummary[]; totalPages: number; totalElements: number }> => {
    const response = await httpClient.get<ApiResponse<PaginationResponse<DoctorBackendDto>>>(
      `${ENDPOINTS.DOCTORS.LIST}?page=${page}&size=${size}`
    );
    
    return {
      doctors: response.data.content.map(mapBackendDoctorToSummary),
      totalPages: response.data.totalPages,
      totalElements: response.data.totalElements,
    };
  },

  getDoctorById: async (id: string): Promise<Doctor> => {
    const response = await httpClient.get<ApiResponse<DoctorBackendDto>>(
      ENDPOINTS.DOCTORS.DETAIL(id)
    );
    return mapBackendDoctorToDoctor(response.data);
  },

  getDoctorsBySpecialty: async (specialty: DoctorSpecialty, page: number = 0, size: number = 10): Promise<{ doctors: DoctorSummary[]; totalPages: number }> => {
    const response = await httpClient.get<ApiResponse<PaginationResponse<DoctorBackendDto>>>(
      `${ENDPOINTS.DOCTORS.BY_SPECIALTY(specialty)}?page=${page}&size=${size}`
    );
    return {
      doctors: response.data.content.map(mapBackendDoctorToSummary),
      totalPages: response.data.totalPages,
    };
  },

  searchDoctors: async (query: string): Promise<DoctorSummary[]> => {
    const response = await httpClient.get<ApiResponse<DoctorSummary[]>>(
      `${ENDPOINTS.DOCTORS.SEARCH}?q=${encodeURIComponent(query)}`
    );
    return response.data || [];
  },

  getAvailableSlots: async (doctorId: string, date: string): Promise<any[]> => {
    const response = await httpClient.get<ApiResponse<any[]>>(
      `/doctors/${doctorId}/available-slots?date=${date}`
    );
    return response.data || [];
  },

  getAppointments: async (): Promise<Appointment[]> => {
    const response = await httpClient.get<ApiResponse<Appointment[]>>(ENDPOINTS.APPOINTMENTS.LIST);
    return response.data || [];
  },

  getAppointmentById: async (id: string): Promise<Appointment | null> => {
    const response = await httpClient.get<ApiResponse<Appointment>>(ENDPOINTS.APPOINTMENTS.DETAIL(id));
    return response.data || null;
  },

  bookAppointment: async (data: { userId: number; doctorId: string; date: string; time: string; type: string; notes?: string }): Promise<any> => {
    const typeMap: Record<string, string> = {
      'in-person': 'IN_PERSON',
      'video': 'VIDEO',
      'chat': 'CHAT',
    };
    
    const response = await httpClient.post<ApiResponse<any>>(
      '/appointments',
      {
        userId: data.userId,
        doctorId: Number(data.doctorId),
        date: data.date,
        time: data.time,
        type: typeMap[data.type] || 'IN_PERSON',
        status: 'SCHEDULED',
      }
    );
    return response.data;
  },

  updateAppointment: async (id: string, data: Partial<Appointment>): Promise<Appointment> => {
    const response = await httpClient.put<ApiResponse<Appointment>>(ENDPOINTS.APPOINTMENTS.UPDATE(id), data);
    return response.data;
  },

  cancelAppointment: async (id: string): Promise<void> => {
    await httpClient.post(`/appointments/${id}/cancel`, {});
  },

  deleteAppointment: async (id: string): Promise<void> => {
    await httpClient.delete(`/appointments/${id}`);
  },

  getUserAppointments: async (userId: string | number): Promise<any[]> => {
    const response = await httpClient.get<ApiResponse<PaginationResponse<any>>>(
      `/appointments/user/${userId}`
    );
    return response.data?.content || [];
  },
};
