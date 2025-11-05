import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import ConfirmationModal from '../components/Common/ConfirmationModal';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useAuth } from "../context/AuthContext";
import { useFocusEffect } from '@react-navigation/native';
import DashboardLayout from "../components/Layout/DashboardLayout";
import { usersAPI, tasksAPI } from "../services/api";
import CustomSelect from "../components/Common/CustomSelect";
import { useTaskFilters } from "../hooks/useTaskFilters";
import TaskFilterBar from "../components/Tasks/TaskFilterBar";

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { COLORS, SPACING, BORDERS } from '../styles/theme';

// --- Componente del Formulario (Modal) ---
const TaskForm = ({ visible, task, onSave, onCancel, api }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    usuario_asignado: null,
  });
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const priorityOptions = [
    { label: 'Baja', value: 'baja' },
    { label: 'Media', value: 'media' },
    { label: 'Alta', value: 'alta' },
    { label: 'Urgente', value: 'urgente' },
  ];

  React.useEffect(() => {
    const initForm = () => {
      if (task) {
        setFormData({
          titulo: task.titulo || '',
          descripcion: task.descripcion || '',
          prioridad: task.prioridad || 'media',
          usuario_asignado: task.usuario_asignado || null,
        });
      } else {
        setFormData({
          titulo: '',
          descripcion: '',
          prioridad: 'media',
          usuario_asignado: user?.id,
        });
      }
    };

    const fetchUsers = async () => {
      if (user?.rol === 'admin' || user?.rol === 'supervisor') {
        try {
          const res = await usersAPI.getAll();
          setUsers(res.data.data || []);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      }
    };

    if (visible) {
      initForm();
      fetchUsers();
    }
  }, [task, visible, user]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.titulo.trim()) {
      Alert.alert("Error", "El título es obligatorio.");
      return;
    }
    setLoading(true);
    try {
      if (task) {
        await api.put(`/tasks/${task.id}`, formData);
      } else {
        await api.post('/tasks', formData);
      }
      onSave();
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la tarea.");
      console.error("Error saving task:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const isAdminOrSupervisor = user?.rol === 'admin' || user?.rol === 'supervisor';

  return (
        <Modal visible={visible} animationType="fade" onRequestClose={onCancel} transparent={true}>
      <View style={styles.modalContainer}>
        <Animated.View 
          style={styles.modalContent}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
        >
          <ScrollView>
            <Text style={styles.modalTitle}>{task ? 'Editar Tarea' : 'Nueva Tarea'}</Text>
            <Text style={styles.label}>Título</Text>
            <TextInput
              style={styles.input}
              placeholder="Título de la tarea"
              placeholderTextColor={COLORS.placeholder}
              value={formData.titulo}
              onChangeText={(val) => handleChange('titulo', val)}
            />
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
              placeholder="(Opcional)"
              placeholderTextColor={COLORS.placeholder}
              value={formData.descripcion}
              onChangeText={(val) => handleChange('descripcion', val)}
              multiline
            />

            <CustomSelect
              label="Prioridad"
              data={priorityOptions}
              selectedValue={formData.prioridad}
              onValueChange={(val) => handleChange('prioridad', val)}
            />

            {isAdminOrSupervisor && (
              <CustomSelect
                label="Asignar a"
                data={users}
                selectedValue={formData.usuario_asignado}
                onValueChange={(val) => handleChange('usuario_asignado', val)}
                displayField="nombre"
                valueField="id"
              />
            )}

          </ScrollView>
          <View style={styles.modalActions}>
            <Button title="Cancelar" onPress={onCancel} style={{ marginRight: SPACING.sm }} />
            <Button title={loading ? 'Guardando...' : 'Guardar'} onPress={handleSubmit} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// --- Componente de Tarjeta de Estadísticas ---
const StatCard = ({ label, value, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// --- Pantalla Principal de Tareas ---
export default function TasksScreen() {
  const { api, user } = useAuth();
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [rawTasks, setRawTasks] = useState([]);
  const [stats, setStats] = useState({ pendientes: 0, en_progreso: 0, prioritarias: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const { filters, sortBy, updateFilters, updateSortBy, filteredTasks } = useTaskFilters(rawTasks, user);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, statsRes] = await Promise.all([
        api.get("/tasks"), // Se obtienen todas las tareas
        api.get("/tasks/stats")
      ]);
      setRawTasks(tasksRes.data.data || []);
      setStats(statsRes.data.data || { pendientes: 0, en_progreso: 0, prioritarias: 0 });
    } catch (e) {
      console.error("Error fetching tasks data:", e.response?.data || e.message);
      Alert.alert("Error", "No se pudieron cargar los datos de las tareas.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const toggleTaskCompleted = async (task) => {
    const newEstado = task.estado === 'completada' ? 'pendiente' : 'completada';
    try {
      await tasksAPI.update(task.id, { ...task, estado: newEstado });
      fetchData(); // Recargar datos para que el cambio se refleje
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el estado de la tarea.");
      console.error("Error toggling task state:", error.response?.data || error.message);
    }
  };

  const handleDeleteTask = (task) => {
    // Open our shared ConfirmationModal with the selected task
    setTaskToDelete(task);
    setIsConfirmVisible(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await api.delete(`/tasks/${taskToDelete.id}`);
      setIsConfirmVisible(false);
      setTaskToDelete(null);
      fetchData();
    } catch (error) {
      setIsConfirmVisible(false);
      setTaskToDelete(null);
      Alert.alert("Error", "No se pudo eliminar la tarea.");
      console.error("Error deleting task:", error.response?.data || error.message);
    }
  };

  const handleTaskSaved = () => {
    setShowForm(false);
    setEditingTask(null);
    fetchData();
  };

  const renderTaskItem = ({ item }) => {
    const canDelete = user?.rol === 'admin' || user?.rol === 'supervisor';
    const canEdit = canDelete || item.usuario_asignado === user?.id;
    const isCompleted = item.estado === 'completada';

  const priorityColors = { alta: COLORS.error, media: COLORS.accent, baja: COLORS.success, urgente: COLORS.error };
  const statusColors = { pendiente: COLORS.accent, en_progreso: COLORS.primary, completada: COLORS.success };

    return (
      <View style={[styles.task, isCompleted && styles.taskCompleted]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.taskText}>{item.titulo}</Text>
          <Text style={styles.taskAssignee}>Asignada a: {item.asignado_nombre}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[item.estado] || COLORS.textSecondary }]}>
            <Text style={styles.statusBadgeText}>{item.estado.replace('_', ' ')}</Text>
          </View>
        </View>
        <View style={styles.taskRight}>
          <View style={[styles.priorityIndicator, { backgroundColor: priorityColors[item.prioridad] || COLORS.textSecondary }]} />
          {/* Toggle completed state: available to all roles */}
          <TouchableOpacity onPress={() => toggleTaskCompleted(item)} style={isCompleted ? styles.revertButton : styles.completeButton}>
            <Text style={styles.actionText}>{isCompleted ? '✕' : '✓'}</Text>
          </TouchableOpacity>
          {canEdit && (
            <TouchableOpacity onPress={() => handleEditTask(item)}>
              <Text style={styles.actionText}>✏️</Text>
            </TouchableOpacity>
          )}
          {canDelete && (
            <TouchableOpacity onPress={() => handleDeleteTask(item)}>
              <Text style={styles.actionText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <DashboardLayout>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1, marginTop: SPACING.md }} />
        ) : (
          <FlatList
            style={{ flex: 1 }}
            data={filteredTasks}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderTaskItem}
            ListHeaderComponent={
              <>
                <View style={styles.header}>
                  <Text style={styles.title}>Gestión de Tareas</Text>
                  <Button title="Nueva Tarea" onPress={handleCreateTask} />
                </View>

                {/* --- Sección de Estadísticas --- */}
                <View style={styles.statsContainer}>
                  <StatCard label="Pendientes" value={stats.pendientes} color={COLORS.accent} />
                  <StatCard label="En Progreso" value={stats.en_progreso} color={COLORS.primary} />
                  <StatCard label="Urgentes" value={stats.prioritarias} color={COLORS.error} />
                </View>

                {/* --- Nueva Barra de Filtros --- */}
                <TaskFilterBar 
                  filters={filters}
                  sortBy={sortBy}
                  updateFilters={updateFilters}
                  updateSortBy={updateSortBy}
                />
              </>
            }
            ListEmptyComponent={<Text style={styles.emptyText}>No hay tareas para mostrar con los filtros seleccionados.</Text>}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        <TaskForm
          visible={showForm}
          task={editingTask}
          onSave={handleTaskSaved}
          onCancel={() => setShowForm(false)}
          api={api}
        />
        <ConfirmationModal
          visible={isConfirmVisible}
          message={`¿Estás seguro de que quieres eliminar la tarea "${taskToDelete?.titulo}"?`}
          onConfirm={confirmDeleteTask}
          onCancel={() => { setIsConfirmVisible(false); setTaskToDelete(null); }}
        />
      </View>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  title: { fontSize: 22, color: COLORS.textPrimary, fontWeight: '700' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.md },
  statCard: { backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: BORDERS.radius, alignItems: 'center', flex: 1, marginHorizontal: SPACING.xs, borderLeftWidth: 4 },
  statValue: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700' },
  statLabel: { color: COLORS.textSecondary, fontSize: 12, marginTop: SPACING.xs },
  task: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: BORDERS.radius,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E6EEF3',
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  taskCompleted: {
    opacity: 0.7,
  },
  taskText: { color: COLORS.textPrimary, fontSize: 16 },
  taskAssignee: { color: COLORS.textSecondary, fontSize: 12, marginTop: SPACING.xs },
  taskRight: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  priorityIndicator: { width: 10, height: 10, borderRadius: 5 },
  actionText: { fontSize: 18 },
  emptyText: { color: COLORS.placeholder, textAlign: 'center', marginTop: SPACING.xxl },
  statusBadge: {
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  completeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal Styles
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.6)' 
  },
  modalContent: { 
    width: '90%', 
    maxWidth: 600,
    maxHeight: '80%', 
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius,
    padding: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: { fontSize: 20, color: COLORS.textPrimary, fontWeight: '700', marginBottom: SPACING.md },
  input: { 
    backgroundColor: '#f5f5f5', 
    color: COLORS.textPrimary, 
    paddingHorizontal: SPACING.md,
    borderRadius: BORDERS.radius, 
    marginBottom: SPACING.md, 
    height: 48,
    justifyContent: 'center' 
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: SPACING.md, gap: SPACING.sm },
  label: { color: COLORS.placeholder, fontSize: 14, marginBottom: SPACING.xs },
});
