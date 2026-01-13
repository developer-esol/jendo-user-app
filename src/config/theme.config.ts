import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const COLORS = {
  primary: '#7B2D8E',
  primaryLight: '#9C4DB8',
  primaryDark: '#5A1F6A',
  primaryGradientStart: '#7B2D8E',
  primaryGradientEnd: '#9C4DB8',
  
  secondary: '#C84B96',
  secondaryLight: '#E8A0C9',
  secondaryDark: '#A03377',
  
  accent: '#7B2D8E',
  accentLight: '#F3E5F5',
  
  success: '#4CAF50',
  successLight: '#E8F5E9',
  warning: '#FFC107',
  warningLight: '#FFF8E1',
  error: '#E53935',
  errorLight: '#FFEBEE',
  info: '#2196F3',
  infoLight: '#E3F2FD',
  
  riskLow: '#4CAF50',
  riskLowBg: '#E8F5E9',
  riskLowText: '#2E7D32',
  riskModerate: '#FF9800',
  riskModerateBg: '#FFF3E0',
  riskModerateText: '#E65100',
  riskHigh: '#E53935',
  riskHighBg: '#FFEBEE',
  riskHighText: '#C62828',
  
  background: '#F7F7F9',
  backgroundSecondary: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F5F7',
  cardBackground: '#FFFFFF',
  
  text: '#1A1A2E',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textMuted: '#B0BEC5',
  textOnPrimary: '#FFFFFF',
  textOnDark: '#FFFFFF',
  
  border: '#E8E8EC',
  borderLight: '#F3F4F6',
  borderPurple: '#E8D4ED',
  divider: '#E0E0E0',
  headerAccent: '#E91E63',
  
  disabled: '#BDBDBD',
  placeholder: '#9E9E9E',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.3)',
  
  white: '#FFFFFF',
  black: '#000000',
  
  tabActive: '#7B2D8E',
  tabInactive: '#9CA3AF',
  tabActiveBg: '#7B2D8E',
  
  iconPrimary: '#7B2D8E',
  iconSecondary: '#6B7280',
  iconLight: '#9CA3AF',
  
  gradientStart: '#7B2D8E',
  gradientEnd: '#9C4DB8',
  
  heart: '#7B2D8E',
  heartBg: '#F3E5F5',
  wellness: '#7B2D8E',
  wellnessBg: '#F3E5F5',
  doctor: '#7B2D8E',
  doctorBg: '#F3E5F5',
  report: '#7B2D8E',
  reportBg: '#F3E5F5',
  notification: '#7B2D8E',
  notificationBg: '#F3E5F5',
  
  categoryDiet: '#E8F5E9',
  categoryDietIcon: '#4CAF50',
  categoryExercise: '#FFF8E1',
  categoryExerciseIcon: '#FF9800',
  categorySleep: '#E3F2FD',
  categorySleepIcon: '#1976D2',
  categoryStress: '#FCE4EC',
  categoryStressIcon: '#E91E63',
  
  coreInfo: '#E3F2FD',
  coreInfoIcon: '#1976D2',
  coreInvestigation: '#E8F5E9',
  coreInvestigationIcon: '#4CAF50',
  treatment: '#F3E5F5',
  treatmentIcon: '#7B2D8E',
  selfManagement: '#FFF8E1',
  selfManagementIcon: '#FF9800',
  urgent: '#FFEBEE',
  urgentIcon: '#E53935',
  
  inputBg: '#FFFFFF',
  inputBorder: '#E8E8EC',
  inputFocusBorder: '#7B2D8E',
  
  chartLine: '#7B2D8E',
  chartArea: 'rgba(123, 45, 142, 0.1)',
  chartGrid: '#E8E8EC',
};

export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
    display: 40,
    score: 56,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  round: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  card: {
    shadowColor: '#7B2D8E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    primaryContainer: COLORS.primaryLight,
    secondary: COLORS.secondary,
    secondaryContainer: COLORS.secondaryLight,
    error: COLORS.error,
    errorContainer: COLORS.errorLight,
    background: COLORS.background,
    surface: COLORS.surface,
    surfaceVariant: COLORS.surfaceSecondary,
    onPrimary: COLORS.textOnPrimary,
    onBackground: COLORS.text,
    onSurface: COLORS.text,
    outline: COLORS.border,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.primaryLight,
    primaryContainer: COLORS.primary,
    secondary: COLORS.secondaryLight,
    secondaryContainer: COLORS.secondary,
    error: COLORS.error,
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    onPrimary: COLORS.textOnDark,
    onBackground: COLORS.white,
    onSurface: COLORS.white,
    outline: '#404040',
  },
};
