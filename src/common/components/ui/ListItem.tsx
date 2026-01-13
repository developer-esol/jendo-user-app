import React, { ReactNode } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../config/theme.config';

interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  leftIconColor?: string;
  leftIconBgColor?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  description,
  leftIcon,
  leftIconColor = COLORS.primary,
  leftIconBgColor,
  leftElement,
  rightElement,
  showChevron = false,
  onPress,
  disabled = false,
  style,
}) => {
  const content = (
    <View style={[styles.container, disabled && styles.disabled, style]}>
      {(leftIcon || leftElement) && (
        <View style={styles.leftSection}>
          {leftElement || (
            <View style={[styles.iconContainer, leftIconBgColor && { backgroundColor: leftIconBgColor }]}>
              <Ionicons name={leftIcon!} size={22} color={leftIconColor} />
            </View>
          )}
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        {description && <Text style={styles.description} numberOfLines={2}>{description}</Text>}
      </View>

      {(rightElement || showChevron) && (
        <View style={styles.rightSection}>
          {rightElement || (
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          )}
        </View>
      )}
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
  },
  disabled: {
    opacity: 0.5,
  },
  leftSection: {
    marginRight: SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textLight,
    marginTop: 4,
  },
  rightSection: {
    marginLeft: SPACING.sm,
  },
});
