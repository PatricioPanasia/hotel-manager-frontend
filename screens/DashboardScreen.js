import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { tasksAPI, attendanceAPI, notesAPI } from "../services/api";
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { COLORS, SPACING, BORDERS } from '../styles/theme';

// --- Componentes Reutilizables (Traducción de MUI) ---

const StatCard = ({ icon, title, value, subtitle, color, onClick, loading }) => {
  const [showIcon, setShowIcon] = React.useState(true);

  const handleLayout = (e) => {
    const width = e.nativeEvent.layout.width;
    // hide icon earlier on small screens to avoid overlap with text
    // increase threshold so icon disappears before the text grows too much
    setShowIcon(width > 220);
  };

  return (
    <View style={styles.cardTouchable} onLayout={handleLayout}>
      <Card style={[styles.card, styles.statCard]}>
        <View>
          <Text style={styles.statCardTitle}>{title}</Text>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <Text style={styles.statCardValue}>{value}</Text>
          )}
          <Text style={styles.statCardSubtitle}>{subtitle}</Text>
        </View>
        {showIcon && (
          <View style={styles.iconBox} pointerEvents="none">
            <Text style={[styles.iconText, { color }]}>{icon}</Text>
          </View>
        )}
      </Card>
    </View>
  );
};

const QuickAction = ({ icon, title, description, buttonText, onClick, color = COLORS.accent }) => (
  <Card style={[styles.card, styles.quickActionCard]}>
    <View style={styles.quickActionHeader}>
      <Text style={{ color: COLORS.textPrimary, fontSize: 28, marginRight: 12 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionDesc}>{description}</Text>
      </View>
    </View>
    <Button title={buttonText} onPress={onClick} style={{ backgroundColor: color }} />
  </Card>
);

// --- Pantalla Principal del Dashboard ---

export default function DashboardScreen() {
  const { user } = useAuth(); 
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    tasks: { pendientes: 0 },
    attendance: { presentes_hoy: 0, total_empleados: 0 },
    notes: { unread: 0 },
  });
  const [loading, setLoading] = useState(true);

  console.log('User object in DashboardScreen:', user);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        tasksAPI.getStats(),
        attendanceAPI.getStats(),
        notesAPI.getStats(),
      ]);

      const next = { ...stats };

      // Tasks
      if (results[0].status === 'fulfilled') {
        next.tasks = results[0].value.data.data || {};
      } else {
        console.error('Dashboard: tasks stats failed', results[0].reason);
      }

      // Attendance
      if (results[1].status === 'fulfilled') {
        next.attendance = results[1].value.data.data || {};
      } else {
        console.error('Dashboard: attendance stats failed', results[1].reason);
      }

      // Notes
      if (results[2].status === 'fulfilled') {
        next.notes = results[2].value.data.data || {};
      } else {
        console.error('Dashboard: notes stats failed', results[2].reason);
      }

      // Fallback: if pendientes is missing or zero, try counting via tasks list (server paginates with count)
      try {
        if (!next.tasks || typeof next.tasks.pendientes !== 'number' || next.tasks.pendientes === 0) {
          const pendingRes = await tasksAPI.getAll({ estado: 'pendiente', page: 1, limit: 1 });
          const totalPend = pendingRes.data?.pagination?.total ?? 0;
          next.tasks = { ...(next.tasks || {}), pendientes: totalPend, total: next.tasks?.total };
        }
      } catch (fallbackErr) {
        console.warn('Dashboard: fallback pending count failed', fallbackErr?.response?.data || fallbackErr?.message);
      }

      setStats(next);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recargar datos cada vez que vuelves al tab Dashboard
  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats])
  );

  // Calcula eficacia: preferimos backend efficiency (excluye tareas personales); fallback a completadas/total
  const computeEficacia = () => {
    const eff = stats.tasks?.efficiency;
    if (eff && typeof eff.percentage === 'number') {
      return `${eff.percentage}%`;
    }
    const total = Number(stats.tasks?.total || 0);
    const completadas = Number(stats.tasks?.completadas || 0);
    if (total === 0) return '0%';
    const pct = Math.round((completadas / total) * 100);
    return `${pct}%`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <DashboardLayout>
      <ScrollView>
        {/* Header de Bienvenida */}
        <View style={styles.header}>
          <Text style={styles.title}>{getGreeting()}, {user?.nombre} 👋</Text>
          <Text style={styles.subtitle}>Bienvenido al sistema de gestión del hotel</Text>
        </View>

        {/* Estadísticas */}
        <View style={styles.gridContainer}>
          <StatCard
            icon="📋"
            title="Tareas Pendientes"
            value={stats.tasks.pendientes?.toString() || '0'}
            subtitle="Por completar"
            color={COLORS.primary}
            onClick={() => navigation.navigate('Tasks')}
            loading={loading}
          />
          <StatCard
            icon="⏱️"
            title="Asistencia Hoy"
            value={`${stats.attendance.presentes_hoy}/${stats.attendance.total_empleados}`}
            subtitle="Personal presente"
            color={COLORS.success}
            loading={loading}
          />
          <StatCard
            icon="📝"
            title="Notas Activas"
            value={stats.notes.total?.toString() || '0'}
            subtitle="Sin leer"
            color={COLORS.accent}
            onClick={() => navigation.navigate('Notes')}
            loading={loading}
          />
          <StatCard
            icon="📈"
            title="Eficacia"
            value={computeEficacia()}
            subtitle="% tareas completadas"
            color={COLORS.secondary}
            loading={loading}
          />
        </View>

        {/* Acciones Rápidas */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.quickActionsContainer}>
          <QuickAction
            icon="📋"
            title="Gestionar Tareas"
            description="Revisa y asigna nuevas tareas al personal"
            buttonText="Ver Tareas"
            onClick={() => navigation.navigate('Tasks')}
          />
          <QuickAction
            icon="⏱️"
            title="Control de Asistencias"
            description="Registra entrada y salida del personal"
            buttonText="Registrar Asistencia"
            onClick={() => navigation.navigate('Attendance')}
            color={COLORS.error}
          />
          {user && (user.rol === 'admin' || user.rol === 'supervisor') && (
            <QuickAction
              icon="👥"
              title="Gestionar Usuarios"
              description="Añade, edita o elimina usuarios del sistema"
              buttonText="Gestionar Usuarios"
              onClick={() => navigation.navigate('UserManagement')}
              color={COLORS.accent}
            />
          )}
        </View>

        {/* Información del Rol */}
        <View style={styles.roleInfoBox}>
          <Text style={styles.roleInfoTitle}>Tu Rol: {user?.rol}</Text>
          <Text style={styles.roleInfoText}>
            {user?.rol === 'admin' && 'Tienes acceso completo al sistema para gestionar usuarios, tareas, reportes y configuraciones.'}
            {user?.rol === 'supervisor' && 'Puedes gestionar usuarios y tareas.'}
            {user?.rol !== 'admin' && user?.rol !== 'supervisor' && 'Puedes ver tus tareas asignadas, registrar tu asistencia y crear notas personales.'}
          </Text>
        </View>
      </ScrollView>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: SPACING.xl },
  title: { fontSize: 22, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  subtitle: { color: COLORS.textSecondary },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', margin: -SPACING.xs },
  cardTouchable: { width: '50%', padding: SPACING.xs },
  card: { borderRadius: BORDERS.cardRadius, padding: SPACING.md, minHeight: 120 },
  statCard: { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', paddingRight: 80 },
  statCardTitle: { color: COLORS.textSecondary, textTransform: 'uppercase', fontSize: 12 },
  statCardValue: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '700', marginVertical: SPACING.xs },
  statCardSubtitle: { color: COLORS.textSecondary, fontSize: 12 },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'absolute',
    right: SPACING.md,
    top: SPACING.md,
  },
  iconText: {
    fontSize: 28,
  },
  sectionTitle: { fontSize: 20, color: COLORS.textPrimary, marginTop: SPACING.lg, marginBottom: SPACING.md },
  quickActionsContainer: { margin: -SPACING.xs },
  quickActionCard: { marginBottom: SPACING.md },
  quickActionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  quickActionTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
  quickActionDesc: { color: COLORS.textSecondary, fontSize: 14 },
  roleInfoBox: { marginTop: SPACING.lg, padding: SPACING.md, backgroundColor: COLORS.primary, borderRadius: BORDERS.radius },
  roleInfoTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginBottom: SPACING.sm },
  roleInfoText: { color: COLORS.white, fontSize: 14 },
});
