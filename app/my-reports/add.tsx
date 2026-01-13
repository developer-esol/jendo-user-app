import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenWrapper } from '../../src/common/components/layout';
import { Header, Button, Input } from '../../src/common/components/ui';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/config/theme.config';

export default function AddRecordRoute() {
  const router = useRouter();
  const { folderId } = useLocalSearchParams();

  return (
    <ScreenWrapper safeArea>
      <Header title="Add Medical Record" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Coming Soon</Text>
        <Text style={styles.description}>
          The ability to add medical records will be available in a future update.
        </Text>
        <Button title="Go Back" onPress={() => router.back()} style={styles.button} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  button: {
    marginTop: SPACING.lg,
  },
});
