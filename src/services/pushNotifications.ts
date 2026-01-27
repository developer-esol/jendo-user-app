import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { backendApi } from './backendApi';
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
    // Ensure messaging is initialized and device is registered for remote messages.
    try {
      await messaging().registerDeviceForRemoteMessages();
      messaging().setAutoInitEnabled(true);
    } catch (regErr) {
      console.debug('Could not register device for remote messages (non-fatal):', regErr);
    }

    // Try to get token with retries. Some environments may return FIS_AUTH_ERROR; retrying and deleting token can help.
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const token = await messaging().getToken();
        if (token) return token;
      } catch (err: any) {
        console.log(`FCM token attempt ${attempt} error`, err?.message || err);

        // Known error: Firebase Installations auth error - give explicit guidance
        const msg = (err && (err.message || String(err))) || '';
        if (msg.includes('FIS_AUTH_ERROR') || msg.includes('FIS_AUTH')) {
          console.warn('FIS_AUTH_ERROR detected - this usually means the Firebase Installations authentication failed.');
          console.warn('Common fixes: ensure google-services.json / GoogleService-Info.plist is present and the package/bundle id matches the Firebase project; add SHA-1 for Android debug keystore in Firebase console.');

          // Try deleting token and retrying once
          try {
            await messaging().deleteToken();
            console.info('Deleted existing FCM token, will retry');
          } catch (delErr) {
            console.warn('Failed to delete FCM token during recovery attempt', delErr);
          }
        }

        // small backoff
        await new Promise((res) => setTimeout(res, attempt * 500));
      }
    }

    console.warn('Unable to retrieve FCM token after retries');
    return null;
  } catch (e) {
    console.log('FCM token error', e);
    return null;
  }
}

export async function registerDeviceToken(userId: string, token: string) {
  const storageKey = `registeredFcmToken:${userId}`;
  try {
    // Avoid re-registering same token repeatedly
    const existing = await AsyncStorage.getItem(storageKey);
    if (existing === token) {
      console.log('✅ FCM token already registered for user, skipping backend call');
      return true;
    }

    const resp = await backendApi.post('/notifications/register-device', {
      userId,
      fcmToken: token,
      platform: Platform.OS,
      deviceInfo: {
        model: Device.modelName,
        osVersion: Device.osVersion
      }
    });

    // On success, persist registered token to avoid duplicate calls
    await AsyncStorage.setItem(storageKey, token);
    console.log('✅ Device token registered:', token, resp);
    return true;
  } catch (e) {
    console.log('Register device token failed', e);
    return false;
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
    const response = await backendApi.post('/notifications/receive', {
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

    // Try to fetch token with a couple of attempts
    let token: string | null = null;
    for (let i = 0; i < 3; i++) {
      token = await getFcmToken();
      if (token) break;
      console.warn(`Attempt ${i + 1} to get FCM token failed, retrying...`);
      await new Promise((res) => setTimeout(res, 1000 * (i + 1)));
    }

    if (token) {
      console.log('🔑 FCM Token:', token);
      const ok = await registerDeviceToken(String(userId), token);
      if (ok) {
        attachNotificationListeners();
        console.log('✅ Push notifications initialized successfully');
      } else {
        console.warn('⚠️ Failed to register FCM token with backend');
      }
    } else {
      console.log('❌ Failed to get FCM token after retries');
    }
  } catch (error) {
    console.error('❌ Error initializing push notifications:', error);
  }
}