import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../common/components/layout';
import { EmptyState } from '../../../common/components/ui';
import { COLORS } from '../../../config/theme.config';
import { useAuth } from '../../../providers/AuthProvider';
import { notificationsApi, NotificationResponse } from '../../../infrastructure/api/notificationsApi';
import { notificationsStyles as styles } from '../components';

type NotificationType = 'RISK_ALERT' | 'TEST_REMINDER' | 'APPOINTMENT' | 'WELLNESS_TIP' | 'DOCTOR_RECOMMENDATION' | 'LEARNING_UPDATE' | 'SYSTEM' | string;

const getNotificationIcon = (type: NotificationType): keyof typeof Ionicons.glyphMap => {
  const normalizedType = type?.toUpperCase() || 'SYSTEM';
  switch (normalizedType) {
    case 'RISK_ALERT': return 'trending-up-outline';
    case 'TEST_REMINDER': return 'pulse-outline';
    case 'APPOINTMENT': 
    case 'APPOINTMENT_REMINDER': return 'calendar-outline';
    case 'WELLNESS_TIP': return 'heart-outline';
    case 'DOCTOR_RECOMMENDATION': return 'medkit-outline';
    case 'LEARNING_UPDATE': return 'book-outline';
    case 'SYSTEM': return 'information-circle-outline';
    default: return 'notifications-outline';
  }
};

const getNotificationColor = (type: NotificationType): string => {
  const normalizedType = type?.toUpperCase() || 'SYSTEM';
  switch (normalizedType) {
    case 'RISK_ALERT': return '#E74C3C';
    case 'TEST_REMINDER': return COLORS.primary;
    case 'APPOINTMENT': 
    case 'APPOINTMENT_REMINDER': return '#3498DB';
    case 'WELLNESS_TIP': return '#27AE60';
    case 'DOCTOR_RECOMMENDATION': return '#9B59B6';
    case 'LEARNING_UPDATE': return '#F39C12';
    case 'SYSTEM': return '#7F8C8D';
    default: return COLORS.primary;
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getNotificationTitle = (type: NotificationType): string => {
  const normalizedType = type?.toUpperCase() || 'SYSTEM';
  switch (normalizedType) {
    case 'RISK_ALERT': return 'Risk Alert';
    case 'TEST_REMINDER': return 'Test Reminder';
    case 'APPOINTMENT': 
    case 'APPOINTMENT_REMINDER': return 'Appointment';
    case 'WELLNESS_TIP': return 'Wellness Tip';
    case 'DOCTOR_RECOMMENDATION': return 'Doctor Recommendation';
    case 'LEARNING_UPDATE': return 'New Learning Content';
    case 'SYSTEM': return 'System Notification';
    default: return 'Notification';
  }
};

export const NotificationsScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      const [notifs, count] = await Promise.all([
        notificationsApi.getByUserId(Number(user.id)),
        notificationsApi.getUnreadCount(Number(user.id))
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notification: NotificationResponse) => {
    if (notification.isRead) return;
    
    const result = await notificationsApi.markAsRead(notification.id);
    if (result) {
      setNotifications(prev =>
        prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id || unreadCount === 0) return;
    
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          onPress: async () => {
            const success = await notificationsApi.markAllAsRead(Number(user.id));
            if (success) {
              setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
              setUnreadCount(0);
            }
          }
        }
      ]
    );
  };

  const handleDelete = async (notificationId: number) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await notificationsApi.delete(notificationId);
            if (success) {
              const notification = notifications.find(n => n.id === notificationId);
              if (notification && !notification.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
              }
              setNotifications(prev => prev.filter(n => n.id !== notificationId));
            }
          }
        }
      ]
    );
  };

  const renderNotification = ({ item }: { item: NotificationResponse }) => {
    const iconColor = getNotificationColor(item.type);
    
    return (
      <TouchableOpacity
        onPress={() => handleMarkAsRead(item)}
        onLongPress={() => handleDelete(item.id)}
        activeOpacity={0.7}
        style={[
          styles.notificationCard,
          !item.isRead && { backgroundColor: '#F8F9FF' }
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={getNotificationIcon(item.type)} size={24} color={iconColor} />
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, !item.isRead && { fontWeight: '700' }]} numberOfLines={1}>
              {getNotificationTitle(item.type)}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper safeArea backgroundColor={COLORS.white}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.bellContainer}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} />
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 16, color: COLORS.textSecondary }}>Loading notifications...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper safeArea backgroundColor={COLORS.white}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.bellContainer}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} />
          {unreadCount > 0 && (
            <View style={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: '#E74C3C',
              borderRadius: 10,
              minWidth: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ color: 'white', fontSize: 11, fontWeight: '600' }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      {unreadCount > 0 && (
        <TouchableOpacity 
          onPress={handleMarkAllAsRead}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Ionicons name="checkmark-done-outline" size={18} color={COLORS.primary} />
          <Text style={{ color: COLORS.primary, marginLeft: 4, fontSize: 14 }}>
            Mark all as read
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={[
          styles.listContent,
          notifications.length === 0 && { flex: 1 }
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="No Notifications"
            description="You're all caught up! Check back later for updates about your health journey."
          />
        }
        ListFooterComponent={
          notifications.length > 0 ? (
            <Text style={{ 
              textAlign: 'center', 
              color: COLORS.textSecondary, 
              fontSize: 12,
              paddingVertical: 16,
            }}>
              Long press a notification to delete it
            </Text>
          ) : null
        }
      />
    </ScreenWrapper>
  );
};
