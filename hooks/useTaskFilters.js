import { useState, useMemo, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FILTER_PREFERENCES_KEY = 'user_task_filter_preferences';

export const useTaskFilters = (initialTasks = [], currentUser) => {
  const [filters, setFilters] = useState({
    status: [], // 'pendiente', 'en_progreso', 'completada'
    priority: [], // 'baja', 'media', 'alta', 'urgente'
    type: null, // 'personal', 'general'
    assignment: null, // 'mias', 'otros'
  });
  const [sortBy, setSortBy] = useState('prioridad_desc'); // ej: 'prioridad_asc', 'fecha_asc', 'estado_asc'

  // Cargar preferencias guardadas
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const saved = await AsyncStorage.getItem(FILTER_PREFERENCES_KEY);
        if (saved) {
          const { savedFilters, savedSortBy } = JSON.parse(saved);
          setFilters(savedFilters);
          setSortBy(savedSortBy);
        }
      } catch (e) {
        console.error("Failed to load filter preferences:", e);
      }
    };
    loadPreferences();
  }, []);

  // Guardar preferencias
  const savePreferences = async (newFilters, newSortBy) => {
    try {
      const prefs = JSON.stringify({ savedFilters: newFilters, savedSortBy: newSortBy });
      await AsyncStorage.setItem(FILTER_PREFERENCES_KEY, prefs);
    } catch (e) {
      console.error("Failed to save filter preferences:", e);
    }
  };

  const updateFilters = (newFilters) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    savePreferences(updated, sortBy);
  };

  const updateSortBy = (newSortBy) => {
    setSortBy(newSortBy);
    savePreferences(filters, newSortBy);
  };

  const filteredAndSortedTasks = useMemo(() => {
    let processedTasks = [...initialTasks];

    // 1. Filtrado
    processedTasks = processedTasks.filter(task => {
      const { status, priority, type, assignment } = filters;

      if (status.length > 0 && !status.includes(task.estado)) {
        return false;
      }
      if (priority.length > 0 && !priority.includes(task.prioridad)) {
        return false;
      }
      if (type) {
        if (type === 'personal' && task.tipo !== 'personal') return false;
        if (type === 'general' && task.tipo !== 'general') return false;
      }
      if (assignment && currentUser) {
        if (assignment === 'mias' && task.usuario_asignado !== currentUser.id) return false;
        if (assignment === 'otros' && task.usuario_asignado === currentUser.id) return false;
      }
      return true;
    });

    // 2. Ordenamiento
    const priorityValues = { baja: 1, media: 2, alta: 3, urgente: 4 };
    const statusValues = { pendiente: 1, en_progreso: 2, completada: 3 };

    processedTasks.sort((a, b) => {
      switch (sortBy) {
        case 'prioridad_desc':
          return (priorityValues[b.prioridad] || 0) - (priorityValues[a.prioridad] || 0);
        case 'prioridad_asc':
          return (priorityValues[a.prioridad] || 0) - (priorityValues[b.prioridad] || 0);
        case 'fecha_desc':
          return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
        case 'fecha_asc':
          return new Date(a.fecha_creacion) - new Date(b.fecha_creacion);
        case 'estado_asc':
          return (statusValues[a.estado] || 0) - (statusValues[b.estado] || 0);
        case 'estado_desc':
            return (statusValues[b.estado] || 0) - (statusValues[a.estado] || 0);
        default:
          return 0;
      }
    });

    return processedTasks;
  }, [initialTasks, filters, sortBy, currentUser]);

  return {
    filters,
    sortBy,
    updateFilters,
    updateSortBy,
    filteredTasks: filteredAndSortedTasks,
  };
};