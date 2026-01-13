import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../config/theme.config';
import { RiskLevel } from '../../../types/models';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  style?: ViewStyle;
}

const getRiskConfig = (level: RiskLevel) => {
  switch (level) {
    case 'low':
      return {
        label: 'Low Risk',
        color: COLORS.riskLow,
        bgColor: COLORS.riskLowBg,
        icon: 'checkmark-circle' as const,
      };
    case 'moderate':
      return {
        label: 'Moderate Risk',
        color: COLORS.riskModerate,
        bgColor: COLORS.riskModerateBg,
        icon: 'alert-circle' as const,
      };
    case 'high':
      return {
        label: 'High Risk',
        color: COLORS.riskHigh,
        bgColor: COLORS.riskHighBg,
        icon: 'warning' as const,
      };
  }
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true,
  style,
}) => {
  const config = getRiskConfig(level);
  
  const sizeStyles = {
    sm: { padding: SPACING.xs, fontSize: TYPOGRAPHY.fontSize.xs, iconSize: 14 },
    md: { padding: SPACING.sm, fontSize: TYPOGRAPHY.fontSize.sm, iconSize: 16 },
    lg: { padding: SPACING.md, fontSize: TYPOGRAPHY.fontSize.md, iconSize: 20 },
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.bgColor, padding: sizeStyles[size].padding },
        style,
      ]}
    >
      {showIcon && (
        <Ionicons
          name={config.icon}
          size={sizeStyles[size].iconSize}
          color={config.color}
          style={styles.icon}
        />
      )}
      <Text style={[styles.label, { color: config.color, fontSize: sizeStyles[size].fontSize }]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.round,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: SPACING.xs,
  },
  label: {
    fontWeight: '600',
  },
});
