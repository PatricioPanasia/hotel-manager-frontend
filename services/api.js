import axios from 'axios';
import { Platform } from 'react-native';
import supabase from '../utils/supabase';

// Base URL controlada por entorno
// Usa EXPO_PUBLIC_API_BASE_URL cuando esté definido (via EAS o variables locales)
// Fallback:
//  - Android: 10.0.2.2 (emulador) para llegar al backend local
//  - iOS/web: localhost
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api'
    : 'http://localhost:5000/api');

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos timeout
});

// Interceptor para agregar token a las requests
api.interceptors.request.use(
  async (config) => {
    console.log(`📤 REQUEST: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    // Get token from Supabase session
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ REQUEST ERROR:', error.message);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => {
    console.log(`✅ RESPONSE: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error(`❌ RESPONSE ERROR:`, {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh session with Supabase
        if (supabase) {
          const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError || !session) {
            // Session refresh failed, sign out
            await supabase.auth.signOut();
            return Promise.reject(refreshError || new Error('Session expired'));
          }
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Refresh error:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: async (id) => {
    console.log(`[api.js] Making DELETE request to /users/${id}`);
    try {
      const response = await api.delete(`/users/${id}`);
      console.log('[api.js] Delete response:', response);
      return response;
    } catch (error) {
      console.error('[api.js] Delete error:', error.response || error.message);
      throw error;
    }
  },
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getUserStats: (id) => api.get(`/users/${id}/stats`),
};

export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (taskData) => api.post('/tasks', taskData),
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  delete: (id) => api.delete(`/tasks/${id}`),
  getStats: () => api.get('/tasks/stats'),
};

export const attendanceAPI = {
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: (data) => api.post('/attendance/check-out', data),
  getAll: (params) => api.get('/attendance', { params }),
  getCurrentStatus: () => api.get('/attendance/status'),
  getStats: () => api.get('/attendance/stats'),
};

export const notesAPI = {
  getAll: (params) => api.get('/notes', { params }),
  getStats: () => api.get('/notes/stats'),
  create: (noteData) => api.post('/notes', noteData),
  update: (id, noteData) => api.put(`/notes/${id}`, noteData),
  delete: (id) => api.delete(`/notes/${id}`),
};

export const reportsAPI = {
  getAll: (params) => api.get('/reports', { params }),
  create: (reportData) => api.post('/reports', reportData),
  update: (id, reportData) => api.put(`/reports/${id}`, reportData),
};

export default api;