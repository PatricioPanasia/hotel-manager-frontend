import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import supabase from '../utils/supabase';

// Base URL controlada por entorno
// Usa EXPO_PUBLIC_API_BASE_URL cuando esté definido (via EAS o variables locales)
// Use Constants.expoConfig.extra for native builds, process.env for web
const API_BASE_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api'
    : 'http://localhost:5000/api');

// Debug: Log API configuration
if (__DEV__) {
  console.log('[API] Base URL:', API_BASE_URL);
}

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
    try {
      console.log(`📤 REQUEST: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      
      // Defensive: Get token from Supabase session with error handling
      if (supabase) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.warn('[API] Error getting session for request:', error);
          } else if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
          } else {
            console.warn('[API] No session found for authenticated request');
          }
        } catch (sessionError) {
          console.error('[API] Exception getting session:', sessionError);
          // Continue without token - let backend handle auth error
        }
      } else {
        console.warn('[API] Supabase not configured - requests will be unauthenticated');
      }
      
      return config;
    } catch (error) {
      console.error('[API] Exception in request interceptor:', error);
      return config; // Return config anyway to allow request
    }
  },
  (error) => {
    console.error('❌ REQUEST SETUP ERROR:', error.message);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación y red
api.interceptors.response.use(
  (response) => {
    console.log(`✅ RESPONSE: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    // Defensive: Handle various error scenarios
    const url = error.config?.url || 'unknown';
    const status = error.response?.status;
    const message = error.message || 'Unknown error';
    
    console.error(`❌ RESPONSE ERROR:`, {
      url,
      status,
      message,
      data: error.response?.data
    });
    
    // Network errors (no response from server)
    if (!error.response) {
      console.error('[API] Network error - no response from server');
      error.userMessage = 'Sin conexión al servidor. Verifica tu conexión a internet.';
      return Promise.reject(error);
    }
    
    const originalRequest = error.config;

    // Handle 401 Unauthorized - try to refresh token
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      if (!supabase) {
        console.error('[API] 401 error but Supabase not configured');
        error.userMessage = 'Sesión expirada. Por favor inicia sesión nuevamente.';
        return Promise.reject(error);
      }
      
      try {
        console.log('[API] Attempting to refresh session...');
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('[API] Refresh error:', refreshError);
          throw refreshError;
        }
        
        if (!session || !session.access_token) {
          console.error('[API] Refresh returned no session');
          throw new Error('No session after refresh');
        }
        
        console.log('[API] Session refreshed successfully');
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('[API] Failed to refresh session:', refreshError);
        
        // Sign out user - session is invalid
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error('[API] Error signing out after refresh failure:', signOutError);
        }
        
        error.userMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
        return Promise.reject(error);
      }
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      error.userMessage = 'La solicitud tardó demasiado. Intenta nuevamente.';
    }
    
    // Handle server errors (500+)
    if (status >= 500) {
      error.userMessage = 'Error en el servidor. Intenta nuevamente más tarde.';
    }
    
    // Handle bad request / validation errors
    if (status === 400) {
      error.userMessage = error.response?.data?.message || 'Datos inválidos.';
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