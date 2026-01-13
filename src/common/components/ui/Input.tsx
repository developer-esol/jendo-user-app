import React from 'react';
import { StyleSheet, StyleProp, TextStyle } from 'react-native';
import { TextInput } from 'react-native-paper';
import { COLORS } from '../../../config/theme.config';

export interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: StyleProp<TextStyle>;
  mode?: 'flat' | 'outlined';
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  disabled = false,
  left,
  right,
  style,
  mode = 'flat',
}) => {
  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      error={!!error}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      multiline={multiline}
      numberOfLines={numberOfLines}
      disabled={disabled}
      left={left}
      right={right}
      style={[styles.input, style]}
      mode={mode}
      underlineColor="transparent"
      activeUnderlineColor="transparent"
      outlineColor="transparent"
      activeOutlineColor="transparent"
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: COLORS.surfaceSecondary,
  },
});
