import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, BORDERS, SPACING } from '../../styles/theme';

const Button = ({ title, onPress, variant = 'primary', style }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const buttonStyle = [
    styles.base,
    variant === 'primary' ? styles.primary : styles.secondary,
    style,
  ];

  const textStyle = [
    styles.text,
    variant === 'primary' ? styles.textPrimary : styles.textSecondary,
  ];

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.8}
      >
        <Text style={textStyle}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: SPACING.md - 4, // 12px
    paddingHorizontal: SPACING.lg, // 24px, adjusted from 20px to fit grid
    borderRadius: BORDERS.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.borderWidth,
    borderColor: COLORS.primary,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  textPrimary: {
    color: COLORS.white,
  },
  textSecondary: {
    color: COLORS.primary,
  },
});

export default Button;
