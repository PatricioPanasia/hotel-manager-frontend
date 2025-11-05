import React from "react";
import { View, StyleSheet } from "react-native";
import Header from "./Header";
import { COLORS, SPACING } from '../../styles/theme';

export default function DashboardLayout({ children }) {
  return (
    <View style={styles.container}>
      <Header />
      <View style={[styles.contentContainer, styles.content]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  contentContainer: { flex: 1 },
  content: { padding: SPACING.md },
});
