import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Platform } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import DashboardLayout from "../components/Layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { attendanceAPI, usersAPI } from "../services/api";
import { useFocusEffect } from "@react-navigation/native";
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CustomSelect from '../components/Common/CustomSelect';
import AlertModal from '../components/Common/AlertModal';
import { COLORS, SPACING, BORDERS } from '../styles/theme';

// --- Pantalla Principal de Asistencia ---
export default function AttendancePageScreen() {
  const { user } = useAuth();
  const [currentStatus, setCurrentStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [expandedDates, setExpandedDates] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Estados para el modal de alerta
  const [alertModal, setAlertModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Función para mostrar alertas con el modal
  const showAlert = (title, message, type = 'info') => {
    setAlertModal({
      visible: true,
      title,
      message,
      type
    });
  };

  const closeAlert = () => {
    setAlertModal({
      visible: false,
      title: '',
      message: '',
      type: 'info'
    });
  };

  // Filtrar historial: para recepcionista, si no hay fechas seleccionadas, no mostrar nada
  const filteredHistory = React.useMemo(() => {
    if (user?.rol === 'recepcionista' && !startDate && !endDate) {
      return []; // No mostrar nada hasta que seleccione fechas
    }
    return history;
  }, [history, user?.rol, startDate, endDate]);

  // Agrupar por fecha usando el historial filtrado
  const groupedByDate = filteredHistory.reduce((acc, rec) => {
    const key = rec.fecha;
    if (!acc[key]) acc[key] = [];
    acc[key].push(rec);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a,b) => (a<b?1:-1));

  const fetchData = async (opts = {}) => {
    setLoading(true);
    try {
      const params = {};
      if (opts.startDate) params.start_date = opts.startDate;
      if (opts.endDate) params.end_date = opts.endDate;
      if (opts.usuario_id) params.usuario_id = opts.usuario_id;

      const [statusRes, historyRes] = await Promise.all([
        attendanceAPI.getCurrentStatus(),
        attendanceAPI.getAll(params)
      ]);
      setCurrentStatus(statusRes.data.data);
      setHistory(historyRes.data.data || []);
    } catch (error) {
      showAlert("Error", "No se pudieron cargar los datos de asistencia.", "error");
      console.error("Error fetching attendance data:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { 
    fetchData(); 
    // Cargar usuarios si es admin o supervisor
    if (user?.rol === 'admin' || user?.rol === 'supervisor') {
      fetchUsers();
    }
  }, []));

  const fetchUsers = async () => {
    try {
  const res = await usersAPI.getAll();
      setUsers(res.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Helpers for date formatting in Argentina timezone
  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    // If it's already a Date
    let d = null;
    if (dateStr instanceof Date) d = dateStr;
    else if (typeof dateStr === 'string') {
      // Try direct parse (handles ISO strings)
      d = new Date(dateStr);
      if (isNaN(d)) {
        // Try YYYY-MM-DD specifically
        const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (m) {
          const [_, y, mo, da] = m;
          d = new Date(`${y}-${mo}-${da}T00:00:00`);
        }
      }
    } else {
      d = new Date(String(dateStr));
    }

    if (!d || isNaN(d)) return 'Invalid Date';

    return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'America/Argentina/Buenos_Aires' });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    // timeStr expected HH:mm:ss
    try {
      const [h, m] = timeStr.split(':');
      return `${h}:${m}`;
    } catch (e) { return timeStr; }
  };

  // ...eliminado, ya se declara más arriba usando filteredHistory...

  const toggleDateExpanded = (date) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
  await attendanceAPI.checkIn({ ubicacion: 'Automático', observaciones: '' });
      showAlert("Éxito", "Entrada registrada correctamente.", "success");
      fetchData();
    } catch (error) {
      showAlert("Error", error.response?.data?.message || "Error al registrar la entrada.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
  await attendanceAPI.checkOut({ ubicacion: 'Automático', observaciones: '' });
      showAlert("Éxito", "Salida registrada correctamente.", "success");
      fetchData();
    } catch (error) {
      showAlert("Error", error.response?.data?.message || "Error al registrar la salida.", "error");
    } finally {
      setActionLoading(false);
    }
  };


  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View>
        <Text style={styles.historyDate}>{formatDateLabel(item.fecha)}</Text>
        {user?.rol !== 'recepcionista' && <Text style={styles.historyUser}>{item.usuario_nombre}</Text>}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.historyTime}>Entrada: {formatTime(item.hora_entrada)}</Text>
        <Text style={styles.historyTime}>Salida: {formatTime(item.hora_salida)}</Text>
      </View>
    </View>
  );

  return (
    <DashboardLayout>
      <View style={styles.container}>
        <FlatList
          ListHeaderComponent={
              <>
                <Text style={styles.title}>Control de Asistencias</Text>
                {/* --- Tarjeta de Estado Actual --- */}
                <Card style={{ marginBottom: SPACING.md }}>
                  <Text style={styles.cardTitle}>Estado Actual</Text>
                  {loading ? <ActivityIndicator color={COLORS.primary} /> : (
                    <>
                      <Text style={styles.statusText}>
                        {currentStatus?.status === 'jornada_finalizada'
                          ? 'Jornada laboral finalizada. Has completado los 4 pares de entrada/salida permitidos para hoy.'
                          : currentStatus?.status === 'no_registrado' && currentStatus?.lastAction?.tipo === 'salida' 
                          ? `Última salida registrada a las ${currentStatus.lastAction.hora}. Puedes fichar entrada nuevamente.`
                          : currentStatus?.status === 'no_registrado' 
                          ? 'Aún no has registrado tu entrada hoy.'
                          : currentStatus?.status === 'entrada_registrada' 
                          ? `Entrada registrada a las ${currentStatus.lastAction.hora}.`
                          : 'Estado desconocido.'}
                      </Text>
                      {currentStatus?.status === 'no_registrado' && (
                        <Button title={actionLoading ? 'Registrando...' : 'Registrar Entrada'} onPress={handleCheckIn} style={{ marginTop: SPACING.md }} />
                      )}
                      {currentStatus?.status === 'entrada_registrada' && (
                        <Button title={actionLoading ? 'Registrando...' : 'Registrar Salida'} onPress={handleCheckOut} style={{ marginTop: SPACING.md, backgroundColor: COLORS.error }} />
                      )}
                    </>
                  )}
                </Card>

                {/* Filtros - Diseño Responsive */}
                <Card style={{ marginBottom: SPACING.md }}>
                  <Text style={styles.cardTitle}>Filtros</Text>
                  
                  {/* Filtro por Usuario (solo admin/supervisor) */}
                  {(user?.rol === 'admin' || user?.rol === 'supervisor') && (
                    <View style={{ marginBottom: SPACING.md }}>
                      <CustomSelect
                        label="Usuario"
                        data={[{ id: null, nombre: 'Todos los usuarios' }, ...users]}
                        selectedValue={selectedUser}
                        onValueChange={(val) => setSelectedUser(val)}
                        displayField="nombre"
                        valueField="id"
                      />
                    </View>
                  )}

                  {/* Filtros de Fecha */}
                  <View style={{ marginBottom: SPACING.sm }}>
                    <Text style={styles.filterLabel}>Fecha desde:</Text>
                    {Platform.OS === 'web' ? (
                      <input
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        value={startDate || ''}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{ padding: 12, borderRadius: 6, border: '1px solid #ddd', width: '100%', fontSize: 14 }}
                      />
                    ) : (
                      <>
                        <TouchableOpacity 
                          style={styles.dateButton}
                          onPress={() => setShowStartPicker(true)}
                        >
                          <Text style={styles.dateButtonText}>
                            {startDate || 'Seleccionar fecha'}
                          </Text>
                        </TouchableOpacity>
                        {showStartPicker && (
                          <DateTimePicker
                            value={startDate ? new Date(startDate) : new Date()}
                            mode="date"
                            maximumDate={new Date()}
                            display="default"
                            onChange={(e, d) => { setShowStartPicker(false); if (d) setStartDate(d.toISOString().split('T')[0]); }}
                          />
                        )}
                      </>
                    )}
                  </View>

                  <View style={{ marginBottom: SPACING.md }}>
                    <Text style={styles.filterLabel}>Fecha hasta:</Text>
                    {Platform.OS === 'web' ? (
                      <input
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        value={endDate || ''}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{ padding: 12, borderRadius: 6, border: '1px solid #ddd', width: '100%', fontSize: 14 }}
                      />
                    ) : (
                      <>
                        <TouchableOpacity 
                          style={styles.dateButton}
                          onPress={() => setShowEndPicker(true)}
                        >
                          <Text style={styles.dateButtonText}>
                            {endDate || 'Seleccionar fecha'}
                          </Text>
                        </TouchableOpacity>
                        {showEndPicker && (
                          <DateTimePicker
                            value={endDate ? new Date(endDate) : new Date()}
                            mode="date"
                            maximumDate={new Date()}
                            display="default"
                            onChange={(e, d) => { setShowEndPicker(false); if (d) setEndDate(d.toISOString().split('T')[0]); }}
                          />
                        )}
                      </>
                    )}
                  </View>

                  {/* Botones de Filtro */}
                  <View style={styles.filterButtons}>
                    <Button 
                      title="Aplicar" 
                      onPress={() => {
                        // Validar que ambas fechas estén seleccionadas si se quiere filtrar por fecha
                        if ((startDate && !endDate) || (!startDate && endDate)) {
                          showAlert(
                            'Rango de fechas incompleto', 
                            'Debes seleccionar ambas fechas (desde y hasta) para filtrar por rango de fechas.',
                            'warning'
                          );
                          return;
                        }
                        
                        // Validar que la fecha "desde" no sea posterior a la fecha "hasta"
                        if (startDate && endDate && startDate > endDate) {
                          showAlert(
                            'Rango de fechas inválido', 
                            `La fecha "desde" (${startDate}) no puede ser posterior a la fecha "hasta" (${endDate}).\n\nPor favor, corrige el rango de fechas.`,
                            'error'
                          );
                          return;
                        }
                        
                        fetchData({ startDate, endDate, usuario_id: selectedUser });
                      }} 
                      style={{ flex: 1, marginRight: SPACING.sm }}
                    />
                    <Button 
                      title="Limpiar" 
                      onPress={() => { 
                        setStartDate(null); 
                        setEndDate(null); 
                        setSelectedUser(null);
                        fetchData(); 
                      }} 
                      style={{ flex: 1 }}
                    />
                  </View>
                </Card>

                <Text style={styles.cardTitle}>Historial por día</Text>
              </>
            }
            data={sortedDates}
            renderItem={({ item: date }) => (
              <View>
                <TouchableOpacity style={styles.historyItem} onPress={() => toggleDateExpanded(date)}>
                  <Text style={styles.historyDate}>{formatDateLabel(date)}</Text>
                  <Text style={styles.historyTime}>{groupedByDate[date].length} registros {expandedDates[date] ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {expandedDates[date] && (
                  groupedByDate[date].map(rec => (
                    <View key={rec.id} style={styles.historyItem}>
                      <View>
                        {/* Solo mostrar nombre si no es recepcionista */}
                        {user?.rol !== 'recepcionista' && <Text style={styles.historyUser}>{rec.usuario_nombre}</Text>}
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.historyTime}>Entrada: {formatTime(rec.hora_entrada)}</Text>
                        <Text style={styles.historyTime}>Salida: {formatTime(rec.hora_salida)}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
            keyExtractor={(item) => item}
          ListEmptyComponent={
            !loading && <Card><Text style={styles.emptyText}>No hay registros de asistencia.</Text></Card>
          }
          ListFooterComponent={loading && <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />}
        />
      </View>

      {/* Modal de Alerta */}
      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={closeAlert}
      />
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, color: COLORS.textPrimary, fontWeight: '700', marginBottom: SPACING.md },
  card: { borderRadius: BORDERS.cardRadius, padding: SPACING.md, marginBottom: SPACING.md },
  cardTitle: { fontSize: 18, color: COLORS.textPrimary, fontWeight: '600', marginBottom: SPACING.sm },
  statusText: { fontSize: 16, color: COLORS.textSecondary },
  button: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: BORDERS.radius },
  buttonPrimary: { backgroundColor: COLORS.primary },
  buttonText: { color: COLORS.white, fontWeight: '700', textAlign: 'center' },
  emptyText: { color: COLORS.placeholder, textAlign: 'center', paddingVertical: SPACING.md },
  // Filtros
  filterLabel: { 
    fontSize: 14, 
    color: COLORS.textPrimary, 
    fontWeight: '600', 
    marginBottom: SPACING.xs 
  },
  dateButton: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: BORDERS.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  // History List
  historyItem: {
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyDate: { color: COLORS.textPrimary, fontSize: 16 },
  historyUser: { color: COLORS.textSecondary, fontSize: 12 },
  historyTime: { color: COLORS.textSecondary, fontSize: 14 },
});
