import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../config/theme.config';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

const getVariantColors = (variant: BadgeVariant) => {
  switch (variant) {
    case 'success':
      return { bg: COLORS.successLight, text: COLORS.success };
    case 'warning':
      return { bg: COLORS.warningLight, text: COLORS.warning };
    case 'error':
      return { bg: COLORS.errorLight, text: COLORS.error };
    case 'info':
      return { bg: COLORS.infoLight, text: COLORS.info };
    case 'primary':
      return { bg: '#E3F2FD', text: COLORS.primary };
    default:
      return { bg: COLORS.surfaceSecondary, text: COLORS.textSecondary };
  }
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  style,
}) => {
  const colors = getVariantColors(variant);
  
  const sizeStyles = {
    sm: { paddingHorizontal: SPACING.sm, paddingVertical: 2, fontSize: TYPOGRAPHY.fontSize.xs },
    md: { paddingHorizontal: SPACING.md, paddingVertical: 4, fontSize: TYPOGRAPHY.fontSize.sm },
    lg: { paddingHorizontal: SPACING.lg, paddingVertical: 6, fontSize: TYPOGRAPHY.fontSize.md },
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.bg, paddingHorizontal: sizeStyles[size].paddingHorizontal, paddingVertical: sizeStyles[size].paddingVertical },
        style,
      ]}
    >
      <Text style={[styles.text, { color: colors.text, fontSize: sizeStyles[size].fontSize }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BORDER_RADIUS.round,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});
