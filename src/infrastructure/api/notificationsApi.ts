import { httpClient } from './httpClient';
import { API_ENDPOINTS } from './endpoints';

export interface NotificationResponse {
  id: number;
  userId: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = {
  // Get notifications for a specific user with pagination
  getByUserId: async (userId: number, page = 0, size = 10): Promise<NotificationResponse[]> => {
    try {
      const response = await httpClient.get<{
        success: boolean;
        data: {
          content: NotificationResponse[];
          pageNumber: number;
          pageSize: number;
          totalElements: number;
          totalPages: number;
          first: boolean;
          last: boolean;
        };
      }>(`/notifications/user/${userId}?page=${page}&size=${size}`);
      return response.data?.content || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  // Get unread count for user
  getUnreadCount: async (userId: number): Promise<number> => {
    try {
      const response = await httpClient.get<{ success: boolean; data: number }>(
        `/notifications/user/${userId}/unread/count`
      );
      return response.data || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  // Mark a notification as read
  markAsRead: async (notificationId: number): Promise<boolean> => {
    try {
      await httpClient.patch(`/notifications/${notificationId}/read`, {});
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  // Mark all notifications as read for user
  markAllAsRead: async (userId: number): Promise<boolean> => {
    try {
      await httpClient.patch(`/notifications/user/${userId}/read-all`, {});
      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  },

  // Delete a notification
  delete: async (notificationId: number): Promise<boolean> => {
    try {
      await httpClient.delete(`/notifications/${notificationId}`);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  },

  // Schedule appointment reminder
  scheduleAppointmentReminder: (appointmentId: string, reminderTimeISO: string) =>
    httpClient.post('/notifications/schedule', {
      appointmentId,
      type: 'APPOINTMENT_REMINDER',
      reminderTime: reminderTimeISO,
    }),

  // Cancel appointment reminder
  cancelAppointmentReminder: (appointmentId: string) =>
    httpClient.delete(`/notifications/appointment/${appointmentId}/reminder`),
};