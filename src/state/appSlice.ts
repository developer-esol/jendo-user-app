import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  loadingMessage: string;
}

interface NotificationState {
  hasUnreadNotifications: boolean;
  notificationCount: number;
}

interface AppSliceState extends LoadingState, NotificationState {
  setLoading: (isLoading: boolean, message?: string) => void;
  setNotifications: (count: number) => void;
  clearNotifications: () => void;
}

export const useAppSlice = create<AppSliceState>((set) => ({
  isLoading: false,
  loadingMessage: '',
  hasUnreadNotifications: false,
  notificationCount: 0,
  setLoading: (isLoading, message = '') =>
    set({ isLoading, loadingMessage: message }),
  setNotifications: (count) =>
    set({ notificationCount: count, hasUnreadNotifications: count > 0 }),
  clearNotifications: () =>
    set({ notificationCount: 0, hasUnreadNotifications: false }),
}));
