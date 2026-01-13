import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Avatar as PaperAvatar } from 'react-native-paper';
import { COLORS } from '../../../config/theme.config';

interface AvatarProps {
  source?: string;
  label?: string;
  size?: number;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  label,
  size = 48,
  style,
}) => {
  if (source) {
    return (
      <PaperAvatar.Image
        source={{ uri: source }}
        size={size}
        style={[styles.avatar, style]}
      />
    );
  }

  if (label) {
    return (
      <PaperAvatar.Text
        label={label.substring(0, 2).toUpperCase()}
        size={size}
        style={[styles.avatar, style]}
      />
    );
  }

  return (
    <PaperAvatar.Icon
      icon="account"
      size={size}
      style={[styles.avatar, style]}
    />
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: COLORS.primary,
  },
});
