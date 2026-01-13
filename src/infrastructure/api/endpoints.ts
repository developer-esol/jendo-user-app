export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/signup',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    REFRESH_TOKEN: '/auth/refresh',
    GOOGLE: '/auth/google',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  DOCTORS: {
    BASE: '/doctors',
    DETAIL: (id: string) => `/doctors/${id}`,
  },
  APPOINTMENTS: {
    BASE: '/appointments',
    DETAIL: (id: string) => `/appointments/${id}`,
  },
  MEDICAL_RECORDS: {
    BASE: '/medical-records',
    DETAIL: (id: string) => `/medical-records/${id}`,
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
  },
  JENDO_TESTS: {
    BASE: '/jendo-tests',
    DETAIL: (id: string) => `/jendo-tests/${id}`,
  },
  WELLNESS: {
    TIPS: '/wellness/tips',
    CHATBOT: '/wellness/chatbot',
    RECOMMENDATIONS: '/wellness-recommendations',
    BY_RISK_LEVEL: (riskLevel: string) => `/wellness-recommendations/risk-level/${riskLevel}`,
    FOR_USER: (userId: number) => `/wellness-recommendations/user/${userId}`,
    DAILY_AI_TIPS: (userId: number) => `/wellness-recommendations/user/${userId}/daily-ai-tips`,
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
  },
};
