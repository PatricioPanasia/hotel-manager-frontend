import React, { useState } from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import { COLORS, BORDERS, SPACING, SHADOWS } from '../../styles/theme';

const Input = (props) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const inputContainerStyle = [
    styles.container,
    isFocused && styles.containerFocused,
  ];

  return (
    <View style={inputContainerStyle}>
      <TextInput
        style={styles.input}
        placeholderTextColor={COLORS.placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: BORDERS.borderWidth,
    borderRadius: BORDERS.radius,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md - 4, // 12px
  },
  containerFocused: {
    borderColor: COLORS.primary,
    ...SHADOWS.inputFocus,
  },
  input: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
});

export default Input;
