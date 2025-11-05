import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING } from '../../styles/theme';

// Sidebar component is no longer used in the layout but kept for potential reuse.
export default function Sidebar() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Navigation</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.sm, backgroundColor: COLORS.primary, borderRadius: 8 },
  text: { color: COLORS.white },
});
