import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { COLORS, SPACING } from '../styles/theme';

export default function DashboardHomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();

  console.log('User object in DashboardHomeScreen:', user);

  return (
    <DashboardLayout>
      <Text style={styles.header}>Dashboard</Text>

      {user && (user.rol === 'admin' || user.rol === 'supervisor') && (
        <View style={{ marginBottom: SPACING.md }}>
          <Button title="User Management" onPress={() => navigation.navigate('UserManagement')} />
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingVertical: SPACING.sm }}>
        <Card style={{ marginBottom: SPACING.md }}>
          <Text style={styles.cardTitle}>Resumen rápido</Text>
          <Text style={styles.cardText}>Aquí puedes ver estadísticas y accesos rápidos.</Text>
        </Card>

        <View style={{ flexDirection: 'row', gap: SPACING.md, justifyContent: 'space-between' }}>
          <Card style={{ flex: 1, marginRight: SPACING.sm }}>
            <Text style={styles.cardTitle}>Tareas</Text>
            <Text style={styles.cardText}>12 pendientes</Text>
          </Card>
          <Card style={{ flex: 1, marginLeft: SPACING.sm }}>
            <Text style={styles.cardTitle}>Notas</Text>
            <Text style={styles.cardText}>5 nuevas</Text>
          </Card>
        </View>
      </ScrollView>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  cardText: {
    color: COLORS.textSecondary,
  },
});
