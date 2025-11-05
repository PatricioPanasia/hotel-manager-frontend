import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { usersAPI } from '../../services/api';
import { COLORS, FONT_SIZES, SPACING, BORDERS } from '../../styles/theme';

const UserStats = ({ user, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (user) {
        try {
          setLoading(true);
          const response = await usersAPI.getUserStats(user.id);
          setStats(response.data.data);
        } catch (error) {
          console.error("Error fetching user stats:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStats();
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistics for {user?.nombre}</Text>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} />
      ) : stats ? (
        <ScrollView>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Task Statistics</Text>
            <Text style={styles.statText}>Total Tasks: {stats.taskStats.total || 0}</Text>
            <Text style={styles.statText}>Pending: {stats.taskStats.pendientes || 0}</Text>
            <Text style={styles.statText}>In Progress: {stats.taskStats.en_progreso || 0}</Text>
            <Text style={styles.statText}>Completed: {stats.taskStats.completadas || 0}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Attendance (Last 30)</Text>
            {stats.attendanceHistory.map((item, index) => (
              <View key={index} style={styles.attendanceItem}>
                <Text style={styles.statText}>Date: {item.fecha}</Text>
                <Text style={styles.statText}>Check-in: {item.hora_entrada}</Text>
                <Text style={styles.statText}>Check-out: {item.hora_salida || 'N/A'}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <Text style={styles.statText}>Could not load statistics.</Text>
      )}

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.buttonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    height: '80%',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDERS.radius,
  },
  title: {
    fontSize: FONT_SIZES.h2,
    color: COLORS.white,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.accent,
    marginBottom: SPACING.sm,
  },
  statText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.body,
    marginBottom: SPACING.xs,
  },
  attendanceItem: {
    backgroundColor: COLORS.secondary,
    padding: SPACING.sm,
    borderRadius: BORDERS.radius / 2,
    marginBottom: SPACING.sm,
  },
  closeButton: {
    backgroundColor: COLORS.secondary,
    padding: SPACING.md,
    borderRadius: BORDERS.radius,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

export default UserStats;