import React from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { COLORS, BORDER_RADIUS, SPACING } from '../../../config/theme.config';

interface ButtonProps {
  title: string;
  onPress: () => void;
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  compact?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  mode = 'contained',
  disabled = false,
  loading = false,
  icon,
  style,
  labelStyle,
  compact = false,
}) => {
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      disabled={disabled || loading}
      loading={loading}
      icon={icon}
      style={[styles.button, style]}
      labelStyle={[styles.label, labelStyle]}
      compact={compact}
    >
      {title}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.xs,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
