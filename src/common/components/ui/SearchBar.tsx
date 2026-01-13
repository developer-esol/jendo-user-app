import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../config/theme.config';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onSubmit,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={onChangeText}
        value={value}
        onSubmitEditing={onSubmit}
        style={styles.searchbar}
        inputStyle={styles.input}
        iconColor={COLORS.textSecondary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchbar: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: BORDER_RADIUS.lg,
    elevation: 0,
  },
  input: {
    fontSize: 16,
  },
});
