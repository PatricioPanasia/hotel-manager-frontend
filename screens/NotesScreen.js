import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import ConfirmationModal from '../components/Common/ConfirmationModal';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useAuth } from "../context/AuthContext";
import { useFocusEffect } from '@react-navigation/native';
import DashboardLayout from "../components/Layout/DashboardLayout";
import { usersAPI } from "../services/api";
import CustomSelect from "../components/Common/CustomSelect";
import NotesFilterBar from "../components/Notes/NotesFilterBar";
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { COLORS, SPACING, BORDERS } from '../styles/theme';

// --- Componente del Formulario (Modal) ---
const NoteForm = ({ visible, note, onSave, onCancel, api, user }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    tipo: 'personal',
    importante: false,
    usuario_asignado: null,
  });
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const initForm = () => {
      if (note) {
        setFormData({
          titulo: note.titulo || '',
          contenido: note.contenido || '',
          tipo: note.tipo || 'personal',
          importante: note.importante || false,
          usuario_asignado: note.usuario_asignado || null,
        });
      } else {
        setFormData({
          titulo: '',
          contenido: '',
          tipo: 'personal',
          importante: false,
          usuario_asignado: null,
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
  }, [note, visible, user]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.titulo.trim() || !formData.contenido.trim()) {
      Alert.alert("Error", "El título y el contenido son obligatorios.");
      return;
    }
    setLoading(true);
    try {
      if (note) {
        await api.put(`/notes/${note.id}`, formData);
      } else {
        await api.post('/notes', formData);
      }
      onSave();
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la nota.");
      console.error("Error saving note:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const isAdminOrSupervisor = user?.rol === 'admin' || user?.rol === 'supervisor';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <Animated.View 
          style={styles.modalContent}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
        >
          <ScrollView>
            <Text style={styles.modalTitle}>{note ? 'Editar Nota' : 'Nueva Nota'}</Text>
            <Text style={styles.label}>Título</Text>
            <TextInput
              style={styles.input}
              placeholder="Título de la nota"
              placeholderTextColor={COLORS.placeholder}
              value={formData.titulo}
              onChangeText={(val) => handleChange('titulo', val)}
            />
            <Text style={styles.label}>Contenido</Text>
            <TextInput
              style={[styles.input, { height: 120, textAlignVertical: 'top', paddingTop: 12 }]}
              placeholder="Escribe tu nota aquí..."
              placeholderTextColor={COLORS.placeholder}
              value={formData.contenido}
              onChangeText={(val) => handleChange('contenido', val)}
              multiline
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

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Importante</Text>
              <Switch
                trackColor={{ false: COLORS.border, true: COLORS.accent }}
                thumbColor={formData.importante ? COLORS.white : COLORS.white}
                onValueChange={(val) => handleChange('importante', val)}
                value={formData.importante}
              />
            </View>
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


// --- Pantalla Principal de Notas ---
export default function NotesScreen() {
  const { api, user } = useAuth();
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [rawNotes, setRawNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [stats, setStats] = useState({ total: 0, importantes: 0, personales: 0 });
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'important', 'personal'

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notesRes, statsRes] = await Promise.all([
        api.get("/notes"), // Se obtienen todas las notas
        api.get("/notes/stats")
      ]);
      setRawNotes(notesRes.data.data || []);
      setStats(statsRes.data.data || { total: 0, importantes: 0, personales: 0 });
    } catch (e) {
      console.error("Error fetching notes data:", e.response?.data || e.message);
      Alert.alert("Error", "No se pudieron cargar las notas.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const filteredNotes = useMemo(() => {
    if (activeFilter === 'all') {
      return rawNotes;
    }
    if (activeFilter === 'important') {
      return rawNotes.filter(note => note.importante);
    }
    if (activeFilter === 'personal') {
      return rawNotes.filter(note => note.tipo === 'personal');
    }
    return rawNotes;
  }, [activeFilter, rawNotes]);

  const handleCreateNote = () => {
    setEditingNote(null);
    setShowForm(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  const handleDeleteNote = (note) => {
    setNoteToDelete(note);
    setIsConfirmVisible(true);
  };

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;
    try {
      await api.delete(`/notes/${noteToDelete.id}`);
      setIsConfirmVisible(false);
      setNoteToDelete(null);
      fetchData();
    } catch (error) {
      setIsConfirmVisible(false);
      setNoteToDelete(null);
      Alert.alert("Error", "No se pudo eliminar la nota.");
      console.error("Error deleting note:", error.response?.data || error.message);
    }
  };

  const handleNoteSaved = () => {
    setShowForm(false);
    setEditingNote(null);
    fetchData();
  };

  const renderNoteItem = ({ item }) => {
    const canModify = user?.rol === 'admin' || item.usuario_id === user?.id;
    return (
      <View style={[styles.note, item.importante && styles.noteImportant]}>
        <View style={styles.noteHeader}>
          <Text style={styles.noteTitle}>{item.titulo}</Text>
          {canModify && (
            <View style={styles.noteActions}>
              <TouchableOpacity onPress={() => handleEditNote(item)}>
                <Text style={styles.actionText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteNote(item)}>
                <Text style={styles.actionText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text style={styles.noteText}>{item.contenido}</Text>
        <Text style={styles.noteAuthor}>Por: {item.usuario_nombre}</Text>
      </View>
    );
  };

  return (
    <DashboardLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Sistema de Notas</Text>
          <Button title="Nueva Nota" onPress={handleCreateNote} />
        </View>

        {/* --- Sección de Estadísticas --- */}
        <View style={styles.statsContainer}>
            <StatCard label="Total Notas" value={stats.total} color={COLORS.primary} />
            <StatCard label="Importantes" value={stats.importantes} color={COLORS.accent} />
            <StatCard label="Personales" value={stats.personales} color={COLORS.success} />
        </View>

        {/* --- Nueva Barra de Filtros --- */}
        <NotesFilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
        ) : (
          <FlatList
            data={filteredNotes}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderNoteItem}
            ListEmptyComponent={<Text style={styles.emptyText}>No hay notas para mostrar.</Text>}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        <NoteForm
          visible={showForm}
          note={editingNote}
          onSave={handleNoteSaved}
          onCancel={() => setShowForm(false)}
          api={api}
          user={user}
        />
        <ConfirmationModal
          visible={isConfirmVisible}
          message={`¿Estás seguro de que quieres eliminar la nota "${noteToDelete?.titulo}"?`}
          onConfirm={confirmDeleteNote}
          onCancel={() => { setIsConfirmVisible(false); setNoteToDelete(null); }}
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
  note: { backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: BORDERS.radius, marginBottom: SPACING.md },
  noteImportant: { borderColor: COLORS.accent, borderWidth: 1 },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  noteTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700', flex: 1 },
  noteActions: { flexDirection: 'row', gap: SPACING.md },
  actionText: { fontSize: 18 },
  noteText: { color: COLORS.textSecondary, fontSize: 14, marginBottom: SPACING.md },
  noteAuthor: { color: COLORS.placeholder, fontSize: 12, fontStyle: 'italic' },
  emptyText: { color: COLORS.placeholder, textAlign: 'center', marginTop: SPACING.xxl },
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
  note: { backgroundColor: '#FFFFFF', padding: SPACING.md, borderRadius: BORDERS.radius, marginBottom: SPACING.md, borderWidth: 1, borderColor: '#E6EEF3', shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 3 },
  noteImportant: { borderColor: COLORS.accent, borderWidth: 1 },
  input: { 
    backgroundColor: '#f5f5f5', 
    color: COLORS.textPrimary, 
    paddingHorizontal: SPACING.md,
    borderRadius: BORDERS.radius, 
    marginBottom: SPACING.md, 
    height: 48,
    justifyContent: 'center' 
  },
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  label: { color: COLORS.placeholder, fontSize: 14, marginBottom: SPACING.xs },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: SPACING.md, gap: SPACING.sm },
});
