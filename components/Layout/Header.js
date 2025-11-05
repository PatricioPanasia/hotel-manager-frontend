import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { COLORS, SPACING } from '../../styles/theme';

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Hotel Manager</Text>
      <View style={styles.userContainer}>
        <Text style={styles.user}>{user?.nombre || user?.name || ''}</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + SPACING.md : SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  title: { color: COLORS.white, fontSize: 18, fontWeight: "700" },
  userContainer: { flexDirection: "row", alignItems: "center" },
  user: { color: COLORS.white, marginRight: SPACING.sm },
  logout: { color: COLORS.accent },
});

