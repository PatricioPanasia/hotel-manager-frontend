import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { usersAPI } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { COLORS, SPACING, BORDERS } from '../../styles/theme';

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

  const StatCard = ({ label, value, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.View 
        style={styles.cardWrapper}
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
      >
        <Card style={styles.card}>
          <Text style={styles.title}>Estadísticas de {user?.nombre}</Text>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: SPACING.xl }} />
          ) : stats ? (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {/* Task Statistics */}
              <Text style={styles.sectionTitle}>📋 Estadísticas de Tareas</Text>
              <View style={styles.statsGrid}>
                <StatCard label="Total" value={stats.taskStats.total || 0} color={COLORS.primary} />
                <StatCard label="Pendientes" value={stats.taskStats.pendientes || 0} color={COLORS.accent} />
                <StatCard label="En Progreso" value={stats.taskStats.en_progreso || 0} color={COLORS.primary} />
                <StatCard label="Completadas" value={stats.taskStats.completadas || 0} color={COLORS.success} />
              </View>

              {/* Efficiency */}
              {stats.efficiency && (
                <>
                  <Text style={styles.sectionTitle}>📈 Eficacia</Text>
                  <View style={styles.efficiencyContainer}>
                    <Text style={styles.efficiencyValue}>{stats.efficiency.percentage}%</Text>
                    <Text style={styles.efficiencyText}>
                      {stats.efficiency.completed_considered} de {stats.efficiency.assigned_considered} tareas completadas
                    </Text>
                  </View>
                </>
              )}

              {/* Recent Attendance */}
              <Text style={styles.sectionTitle}>⏱️ Asistencias Recientes (Últimas 30 días)</Text>
              {stats.attendanceHistory && stats.attendanceHistory.length > 0 ? (
                stats.attendanceHistory.map((item, index) => (
                  <View key={index} style={styles.attendanceItem}>
                    <View style={styles.attendanceRow}>
                      <Text style={styles.attendanceDate}>📅 {item.fecha}</Text>
                    </View>
                    <View style={styles.attendanceDetails}>
                      <Text style={styles.attendanceTime}>
                        ⬇️ Entrada: <Text style={styles.timeValue}>{item.hora_entrada || 'N/A'}</Text>
                      </Text>
                      <Text style={styles.attendanceTime}>
                        ⬆️ Salida: <Text style={styles.timeValue}>{item.hora_salida || 'N/A'}</Text>
                      </Text>
                    </View>
                    {item.ubicacion && (
                      <Text style={styles.attendanceLocation}>📍 {item.ubicacion}</Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Sin registros de asistencia</Text>
              )}
            </ScrollView>
          ) : (
            <Text style={styles.errorText}>No se pudieron cargar las estadísticas.</Text>
          )}

          <Button title="Cerrar" onPress={onClose} style={styles.closeButton} />
        </Card>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: SPACING.md,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '85%',
  },
  card: {
    width: '100%',
    height: '100%',
    padding: SPACING.lg,
  },
  title: {
    fontSize: 20,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
    marginBottom: SPACING.sm,
  },
  statCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.sm,
    borderRadius: BORDERS.radius,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    marginHorizontal: SPACING.xs,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: SPACING.xs,
    textTransform: 'uppercase',
  },
  efficiencyContainer: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: BORDERS.radius,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E6EEF3',
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  efficiencyValue: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  efficiencyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  attendanceItem: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.sm,
    borderRadius: BORDERS.radius,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E6EEF3',
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  attendanceRow: {
    marginBottom: SPACING.xs,
  },
  attendanceDate: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  attendanceDetails: {
    marginBottom: SPACING.xs,
  },
  attendanceTime: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  timeValue: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  attendanceLocation: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  emptyText: {
    color: COLORS.placeholder,
    textAlign: 'center',
    marginVertical: SPACING.md,
    fontSize: 13,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    marginVertical: SPACING.md,
    fontSize: 13,
  },
  closeButton: {
    marginTop: SPACING.md,
  },
});

export default UserStats;