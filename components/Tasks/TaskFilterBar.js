import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CustomSelect from '../Common/CustomSelect';
import MultiSelect from '../Common/MultiSelect';
import { useResponsive } from '../../hooks/useResponsive';
import { COLORS, SPACING, BORDERS, FONT_SIZES } from '../../styles/theme';

const TaskFilterBar = ({ filters, sortBy, updateFilters, updateSortBy }) => {
  const { device } = useResponsive();

  const isMobile = device === 'mobile';

  const statusOptions = [
    { id: 'pendiente', name: 'Pendiente' },
    { id: 'en_progreso', name: 'En Progreso' },
    { id: 'completada', name: 'Completada' },
  ];

  const priorityOptions = [
    { id: 'baja', name: 'Baja' },
    { id: 'media', name: 'Media' },
    { id: 'alta', name: 'Alta' },
    { id: 'urgente', name: 'Urgente' },
  ];

  const assignmentOptions = [
    { label: 'Todas', value: null },
    { label: 'Mis Tareas', value: 'mias' },
    { label: 'De Otros', value: 'otros' },
  ];

  const sortOptions = [
    { label: 'Prioridad (desc)', value: 'prioridad_desc' },
    { label: 'Prioridad (asc)', value: 'prioridad_asc' },
    { label: 'Fecha (reciente)', value: 'fecha_desc' },
    { label: 'Fecha (antigua)', value: 'fecha_asc' },
    { label: 'Estado (asc)', value: 'estado_asc' },
    { label: 'Estado (desc)', value: 'estado_desc' },
  ];

  const getFilterItemStyle = () => {
    switch (device) {
      case 'mobile':
        return { width: '100%' };
      case 'tablet':
        return { width: '48%' };
      default:
        return { flex: 1, minWidth: 180 };
    }
  };

  const clearButtonContainerStyle = isMobile 
    ? { width: '100%', marginTop: 12 }
    : { alignSelf: 'flex-end' };

  return (
    <View style={styles.container}>
      <MultiSelect
        label="Estado"
        options={statusOptions}
        selectedValues={filters.status}
        onSelectionChange={(selected) => updateFilters({ status: selected })}
        containerStyle={getFilterItemStyle()}
      />
      <MultiSelect
        label="Prioridad"
        options={priorityOptions}
        selectedValues={filters.priority}
        onSelectionChange={(selected) => updateFilters({ priority: selected })}
        containerStyle={getFilterItemStyle()}
      />
      <CustomSelect
        label="Asignación"
        data={assignmentOptions}
        selectedValue={filters.assignment}
        onValueChange={(val) => updateFilters({ assignment: val })}
        containerStyle={getFilterItemStyle()}
      />
      <CustomSelect
        label="Ordenar Por"
        data={sortOptions}
        selectedValue={sortBy}
        onValueChange={updateSortBy}
        containerStyle={getFilterItemStyle()}
      />
      <View style={[styles.clearButtonContainer, clearButtonContainerStyle]}>
        <TouchableOpacity 
          onPress={() => updateFilters({ status: [], priority: [], assignment: null })} 
          style={styles.clearButton}
        >
          <Text style={styles.clearButtonText}>Limpiar Filtros</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDERS.radius,
    borderWidth: BORDERS.borderWidth,
    borderColor: COLORS.border,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  clearButtonContainer: {
    justifyContent: 'center',
  },
  clearButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDERS.radius,
    justifyContent: 'center',
    alignItems: 'center',
    height: 48, // Para alinear con la altura de los selectores
  },
  clearButtonText: {
    color: COLORS.placeholder,
    fontWeight: '600',
  },
});

export default TaskFilterBar;
