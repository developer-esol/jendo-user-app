import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { httpClient } from '../infrastructure/api/httpClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Href, router } from 'expo-router';

function getRouter() {
  try {
    // Lazy require to avoid undefined router during early init
    const { router } = require('expo-router');
    return router;
  } catch {
    return null;
  }
}

async function ensureAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
      enableVibrate: true,
      enableLights: true
    });
  }
}

export async function requestPushPermission(): Promise<boolean> {
  await ensureAndroidChannel();
  // Request OS-level notification permission (needed on Android 13+ and iOS)
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const permissionResult = await Notifications.requestPermissionsAsync({
      android: { announcement: true }
    });
    finalStatus = permissionResult.status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Notifications permission not granted by user');
    return false;
  }

  // Ensure FCM authorization (primarily relevant on iOS)
  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

export async function getFcmToken(): Promise<string | null> {
  try {
    const token = await messaging().getToken();
    return token;
  } catch (e) {
    console.log('FCM token error', e);
    return null;
  }
}

export async function registerDeviceToken(userId: string, token: string) {
  try {
    await httpClient.post('/notifications/register-device', {
      userId,
      fcmToken: token,
      platform: Platform.OS,
      deviceInfo: {
        model: Device.modelName,
        osVersion: Device.osVersion
      }
    });
    console.log('✅ Device token registered:', token);
  } catch (e) {
    console.log('Register device token failed', e);
  }
}

/**
 * ✅ Convert Firebase data to string-only object
 */
function normalizeNotificationData(
  data?: Record<string, string | object>
): Record<string, string> {
  if (!data) return {};

  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      normalized[key] = value;
    } else {
      normalized[key] = JSON.stringify(value);
    }
  }
  return normalized;
}

/**
 * ✅ Safely extract userId as string
 */
async function getUserId(data?: Record<string, string | object>): Promise<string | null> {
  try {
    let userId = data?.userId;

    // Convert to string if it's an object
    if (userId && typeof userId === 'object') {
      userId = JSON.stringify(userId);
    }

    // Return if we have a string
    if (typeof userId === 'string') {
      return userId;
    }

    // Fall back to AsyncStorage
    const storedUserId = await AsyncStorage.getItem('userId');
    return storedUserId; // This is already string | null
  } catch (error) {
    console.error('Error getting userId:', error);
    return null;
  }
}

/**
 * Save notification to backend database
 */
async function saveNotificationToBackend(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>,
  fcmMessageId?: string
) {
  try {
    const response = await httpClient.post('/notifications/receive', {
      userId: parseInt(userId),
      message: body || title,
      type: data?.type || 'SYSTEM',
      fcmMessageId: fcmMessageId || `fcm-${Date.now()}`,
      data: data || {},
    });
    console.log('✅ Notification saved to backend:', response);
  } catch (error) {
    console.error('❌ Error saving notification to backend:', error);
  }
}

export function attachNotificationListeners() {
  console.log('🔔 Attaching Firebase notification listeners...');

  // ✅ Foreground messages -> show local notification + save to backend
  messaging().onMessage(async (remoteMessage) => {
    console.log('📬 Foreground notification received:', remoteMessage);

    const title = remoteMessage.notification?.title ?? 'Notification';
    const body = remoteMessage.notification?.body ?? '';
    
    // ✅ Normalize data to Record<string, string>
    const normalizedData = normalizeNotificationData(remoteMessage.data);

    // Show local notification
    await Notifications.scheduleNotificationAsync({
      content: { 
        title, 
        body, 
        data: normalizedData,
        sound: 'default',
      },
      trigger: null
    });

    // ✅ Safely get userId
    const userId = await getUserId(remoteMessage.data);
    if (userId) {
      await saveNotificationToBackend(
        userId,
        title,
        body,
        normalizedData,
        remoteMessage.messageId
      );
    } else {
      console.warn('⚠️ No userId found for notification');
    }
  });

  // ✅ App opened from background by tapping a notification
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('🎯 Opened from background:', remoteMessage?.data);
    const normalizedData = normalizeNotificationData(remoteMessage?.data);
    handleNotificationNavigation(normalizedData);
  });

  // ✅ App opened from quit state by tapping a notification
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log('🎯 Opened from quit state:', remoteMessage?.data);
        const normalizedData = normalizeNotificationData(remoteMessage?.data);
        handleNotificationNavigation(normalizedData);
      }
    });

  // ✅ Handle background messages
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('📬 Background notification received:', remoteMessage);
    
    // ✅ Normalize and safely get data
    const normalizedData = normalizeNotificationData(remoteMessage.data);
    const userId = await getUserId(remoteMessage.data);

    if (userId) {
      const title = remoteMessage.notification?.title ?? 'Notification';
      const body = remoteMessage.notification?.body ?? '';
      await saveNotificationToBackend(
        userId,
        title,
        body,
        normalizedData,
        remoteMessage.messageId
      );
    }
  });

  console.log('✅ All Firebase listeners attached');
}

/**
 * Handle navigation based on notification type
 */
function handleNotificationNavigation(data?: Record<string, string>) {
  if (!data) return;

   const r = getRouter();
  if (!r) {
    console.warn('⚠️ Router not ready yet, skipping navigation');
    return;
  }

  try {
    // Always navigate to notifications screen when a notification is tapped
    r.push('/notifications');
  } catch (error) {
    console.error('Error navigating from notification:', error);
  }
}

export async function initPushForUser(userId?: string | number) {
  if (!userId) {
    console.log('⚠️ No userId provided for push initialization');
    return;
  }

  console.log('🔔 Initializing push notifications for user:', userId);

  try {
    const permitted = await requestPushPermission();
    if (!permitted) {
      console.log('❌ Push permissions not granted');
      return;
    }

    const token = await getFcmToken();
    if (token) {
      console.log('🔑 FCM Token:', token);
      await registerDeviceToken(String(userId), token);
      attachNotificationListeners();
      console.log('✅ Push notifications initialized successfully');
    } else {
      console.log('❌ Failed to get FCM token');
    }
  } catch (error) {
    console.error('❌ Error initializing push notifications:', error);
  }
}