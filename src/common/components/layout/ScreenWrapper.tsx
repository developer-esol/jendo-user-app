import React, { ReactNode } from 'react';
import { StyleSheet, View, ScrollView, ViewStyle, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../../config/theme.config';

interface ScreenWrapperProps {
  children: ReactNode;
  scrollable?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  safeArea?: boolean;
  keyboardAvoiding?: boolean;
  backgroundColor?: string;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = false,
  padded = true,
  style,
  safeArea = true,
  keyboardAvoiding = true,
  backgroundColor,
}) => {
  const containerStyle = [
    styles.container,
    padded && styles.padded,
    backgroundColor && { backgroundColor },
    style,
  ];

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={containerStyle}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={containerStyle}>{children}</View>
  );

  const wrappedContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  if (safeArea) {
    return <SafeAreaView style={styles.flex} edges={['top']}>{wrappedContent}</SafeAreaView>;
  }

  return wrappedContent;
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  padded: {
    padding: SPACING.md,
  },
});
