export type NotificationType = 
  | 'risk_alert'
  | 'test_reminder'
  | 'appointment_reminder'
  | 'wellness_tip'
  | 'doctor_recommendation'
  | 'learning_update'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationPreferences {
  riskAlerts: boolean;
  testReminders: boolean;
  appointmentReminders: boolean;
  wellnessTips: boolean;
  learningUpdates: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}
