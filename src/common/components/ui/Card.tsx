import React, { ReactNode } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';
import { COLORS, BORDER_RADIUS, SPACING } from '../../../config/theme.config';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  mode?: 'elevated' | 'outlined' | 'contained';
}

interface CardComponent extends React.FC<CardProps> {
  Title: typeof PaperCard.Title;
  Content: typeof PaperCard.Content;
  Actions: typeof PaperCard.Actions;
  Cover: typeof PaperCard.Cover;
}

const CardBase: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  mode = 'elevated',
}) => {
  return (
    <PaperCard
      mode={mode}
      onPress={onPress}
      style={[styles.card, style]}
    >
      {children}
    </PaperCard>
  );
};

export const Card = CardBase as CardComponent;
Card.Title = PaperCard.Title;
Card.Content = PaperCard.Content;
Card.Actions = PaperCard.Actions;
Card.Cover = PaperCard.Cover;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginVertical: SPACING.sm,
  },
});
