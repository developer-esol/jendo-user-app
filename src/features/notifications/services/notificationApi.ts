import { Notification, NotificationPreferences, NotificationType } from '../../../types/models';
import { httpClient } from '../../../infrastructure/api';
import { ENDPOINTS } from '../../../config/api.config';

const DUMMY_NOTIFICATIONS: Notification[] = [
  { id: 'notif-001', userId: 'user-001', type: 'test_reminder', title: 'Time for Your Jendo Test', message: 'It has been 2 weeks since your last cardiovascular test.', isRead: false, actionUrl: '/jendo-tests/new', createdAt: '2024-11-28T09:00:00Z' },
  { id: 'notif-002', userId: 'user-001', type: 'appointment_reminder', title: 'Upcoming Appointment', message: 'Reminder: You have an appointment with Dr. Sarah Johnson tomorrow at 10:30 AM.', isRead: false, actionUrl: '/appointments/apt-001', data: { appointmentId: 'apt-001' }, createdAt: '2024-11-27T18:00:00Z' },
  { id: 'notif-003', userId: 'user-001', type: 'wellness_tip', title: 'Daily Wellness Tip', message: 'Try to include at least 5 servings of fruits and vegetables today.', isRead: true, actionUrl: '/wellness', createdAt: '2024-11-27T08:00:00Z' },
  { id: 'notif-004', userId: 'user-001', type: 'risk_alert', title: 'Risk Level Improved!', message: 'Great news! Your cardiovascular risk level has improved from Moderate to Low.', isRead: true, actionUrl: '/jendo-reports/test-001', data: { testId: 'test-001', previousLevel: 'moderate', newLevel: 'low' }, createdAt: '2024-11-15T09:30:00Z' },
  { id: 'notif-005', userId: 'user-001', type: 'learning_update', title: 'New Learning Material', message: 'Check out our new video: "Beginner Cardio Workout"', isRead: true, actionUrl: '/wellness/learning/learn-002', createdAt: '2024-11-20T10:00:00Z' },
  { id: 'notif-006', userId: 'user-001', type: 'doctor_recommendation', title: 'Doctor Recommendation', message: 'Based on your recent test results, we recommend scheduling a consultation.', isRead: false, actionUrl: '/doctors?specialty=cardiologist', createdAt: '2024-11-25T14:00:00Z' },
];

const DUMMY_PREFERENCES: NotificationPreferences = {
  riskAlerts: true,
  testReminders: true,
  appointmentReminders: true,
  wellnessTips: true,
  learningUpdates: true,
  emailNotifications: true,
  pushNotifications: true,
};

export const notificationApi = {
  getNotifications: async (): Promise<Notification[]> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.get<Notification[]>(ENDPOINTS.NOTIFICATIONS.LIST);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 600));
    return DUMMY_NOTIFICATIONS.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getUnreadNotifications: async (): Promise<Notification[]> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.get<Notification[]>(ENDPOINTS.NOTIFICATIONS.UNREAD);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 500));
    return DUMMY_NOTIFICATIONS.filter(n => !n.isRead).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getUnreadCount: async (): Promise<number> => {
    // REAL API - Uncomment when backend is ready
    // const response = await httpClient.get<{ count: number }>(ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    // return response.count;

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 200));
    return DUMMY_NOTIFICATIONS.filter(n => !n.isRead).length;
  },

  markAsRead: async (id: string): Promise<void> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.put<void>(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  markAllAsRead: async (): Promise<void> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.put<void>(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  deleteNotification: async (id: string): Promise<void> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.delete<void>(ENDPOINTS.NOTIFICATIONS.DELETE(id));

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  getPreferences: async (): Promise<NotificationPreferences> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.get<NotificationPreferences>(ENDPOINTS.NOTIFICATIONS.PREFERENCES);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 400));
    return DUMMY_PREFERENCES;
  },

  updatePreferences: async (preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.put<NotificationPreferences>(ENDPOINTS.NOTIFICATIONS.PREFERENCES, preferences);

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...DUMMY_PREFERENCES, ...preferences };
  },

  getNotificationsByType: async (type: NotificationType): Promise<Notification[]> => {
    // REAL API - Uncomment when backend is ready
    // return httpClient.get<Notification[]>(ENDPOINTS.NOTIFICATIONS.BY_TYPE(type));

    // DUMMY DATA - Comment out when connecting to backend
    await new Promise(resolve => setTimeout(resolve, 500));
    return DUMMY_NOTIFICATIONS.filter(n => n.type === type).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
};
