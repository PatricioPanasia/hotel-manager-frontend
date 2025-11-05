import React from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, BORDERS, SPACING, SHADOWS } from '../../styles/theme';

const Card = ({ children, style }) => {
  // Reanimated's entering animations are not fully supported on web in some setups.
  // Fallback to a plain View on web to avoid runtime errors while keeping animations on native.
  if (Platform.OS === 'web') {
    return <View style={[styles.card, style]}>{children}</View>;
  }

  return (
    <Animated.View entering={FadeInDown.duration(350)} style={[styles.card, style]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDERS.cardRadius,
    padding: SPACING.lg,
    borderWidth: BORDERS.borderWidth,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
});

export default Card;
