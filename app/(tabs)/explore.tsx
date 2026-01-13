import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../src/config/theme.config';

export default function ExploreTab() {
  return (
    <View style={styles.container}>
      <Text>Explore</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
