import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface AppState {
  themeMode: ThemeMode;
  isOnboardingCompleted: boolean;
  language: string;
  setThemeMode: (mode: ThemeMode) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setLanguage: (language: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      isOnboardingCompleted: false,
      language: 'en',
      setThemeMode: (mode) => set({ themeMode: mode }),
      setOnboardingCompleted: (completed) => set({ isOnboardingCompleted: completed }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
