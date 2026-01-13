export const ENV_CONFIG = {
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://jendo.mytodoo.com/api',
  appName: process.env.EXPO_PUBLIC_APP_NAME || 'Jendo Health App',
  version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
};
