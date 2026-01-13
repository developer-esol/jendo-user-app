import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Snackbar } from 'react-native-paper';
import { COLORS } from '../config/theme.config';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('info');
  const [duration, setDuration] = useState(3000);

  const hideToast = useCallback(() => {
    setVisible(false);
  }, []);

  const showToast = useCallback((msg: string, type: ToastType = 'info', dur: number = 3000) => {
    setMessage(msg);
    setToastType(type);
    setDuration(dur);
    setVisible(true);
  }, []);

  const getBackgroundColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'info':
      default:
        return COLORS.primary;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={hideToast}
        duration={duration}
        action={{
          label: 'Close',
          onPress: hideToast,
          textColor: '#FFFFFF',
        }}
        style={{
          backgroundColor: getBackgroundColor(toastType),
        }}
      >
        {message}
      </Snackbar>
    </ToastContext.Provider>
  );
};
