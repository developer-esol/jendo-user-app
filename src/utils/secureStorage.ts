/**
 * Secure Storage Utility
 * 
 * Platform-agnostic secure storage for tokens
 * - Uses SecureStore on native platforms (iOS/Android)
 * - Uses localStorage on web (fallback)
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  /**
   * Set item in secure storage
   * @param key Storage key
   * @param value Value to store
   */
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Web: Use localStorage
      localStorage.setItem(key, value);
    } else {
      // Native: Use SecureStore
      await SecureStore.setItemAsync(key, value);
    }
  },

  /**
   * Get item from secure storage
   * @param key Storage key
   * @returns Stored value or null
   */
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      // Web: Use localStorage
      return localStorage.getItem(key);
    } else {
      // Native: Use SecureStore
      return await SecureStore.getItemAsync(key);
    }
  },

  /**
   * Delete item from secure storage
   * @param key Storage key
   */
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Web: Use localStorage
      localStorage.removeItem(key);
    } else {
      // Native: Use SecureStore
      await SecureStore.deleteItemAsync(key);
    }
  },
};
