import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { ScreenWrapper } from '../../src/common/components/layout';
import { Header, Card } from '../../src/common/components/ui';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/config/theme.config';

export default function NotificationSettingsRoute() {
  return (
    <ScreenWrapper safeArea>
      <Header title="Notification Settings" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.description}>
            Notification settings will be available in a future update.
          </Text>
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.md,
  },
  card: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
