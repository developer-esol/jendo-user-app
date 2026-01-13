export type DoctorSpecialty = 
  | 'cardiologist'
  | 'general'
  | 'neurologist'
  | 'dermatologist'
  | 'pediatrician'
  | 'orthopedic'
  | 'gynecologist'
  | 'ophthalmologist'
  | 'psychiatrist'
  | 'endocrinologist';

export type AppointmentType = 'video' | 'audio' | 'in_person' | 'chat';

export interface Doctor {
  id: string;
  name: string;
  specialty: DoctorSpecialty;
  hospital: string;
  experience: number;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  about?: string;
  qualifications: string[];
  availableDays: string[];
  consultationFee: number;
  consultationFees?: Record<string, number>;
  isAvailable: boolean;
  phone?: string;
  email?: string;
}

export interface DoctorSummary {
  id: string;
  name: string;
  specialty: DoctorSpecialty;
  hospital: string;
  rating: number;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  doctor: DoctorSummary;
  date: string;
  time: string;
  type: AppointmentType;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

export interface AppointmentBookingForm {
  doctorId: string;
  date: string;
  time: string;
  type: AppointmentType;
  notes?: string;
}
