// context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { Platform } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import supabase from "../utils/supabase";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check active session on mount
    const initSession = async () => {
      if (!supabase) {
        console.warn("[Auth] Supabase client not configured. Check EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.");
        setLoading(false);
        return;
      }

      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("[Auth] getSession ->", currentSession ? "SESSION FOUND" : "NO SESSION");
        
        if (currentSession) {
          setSession(currentSession);
          const ok = await syncUserProfile(currentSession.user);
          setIsAuthenticated(!!ok);
        }
      } catch (error) {
        console.error("[Auth] Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Safety: if something hangs, ensure loading finishes after a short timeout
    const safety = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn("[Auth] Safety timeout clearing loading state");
        }
        return false;
      });
    }, 4000);

    // Listen for auth state changes
    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth state changed:", event);
          
          if (session) {
            setSession(session);
            const ok = await syncUserProfile(session.user);
            setIsAuthenticated(!!ok);
          } else {
            setSession(null);
            setUser(null);
            setIsAuthenticated(false);
            setAuthError(null);
          }
        }
      );

      return () => {
        authListener?.subscription?.unsubscribe();
        clearTimeout(safety);
      };
    }
    
    return () => clearTimeout(safety);
  }, []);

  const syncUserProfile = async (authUser) => {
    if (!authUser) {
      console.warn("[Auth] syncUserProfile called with no user");
      return false;
    }

    // Defensive: Check if supabase client exists
    if (!supabase) {
      console.error("[Auth] Cannot sync profile - Supabase client not available");
      setAuthError('Configuración de autenticación no disponible');
      return false;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error("[Auth] Error fetching profile:", error);
        // If profile not found or error, deny access
        setAuthError('Tu usuario no está habilitado. Contacta al administrador.');
        await supabase.auth.signOut().catch(e => console.error("[Auth] Error signing out:", e));
        setSession(null);
        setUser(null);
        return false;
      }

      // Defensive: Validate profile structure
      if (!profile || typeof profile !== 'object') {
        console.error("[Auth] Invalid profile structure:", profile);
        setAuthError('Error al cargar perfil de usuario');
        await supabase.auth.signOut().catch(e => console.error("[Auth] Error signing out:", e));
        setSession(null);
        setUser(null);
        return false;
      }

      setUser({
        id: profile.id,
        email: profile.email || authUser.email || '',
        nombre: profile.nombre || 'Usuario',
        rol: profile.rol || 'empleado',
        activo: profile.activo ?? false,
      });

      if (!profile.activo) {
        setAuthError('Tu usuario aún no fue habilitado. Contacta al administrador.');
        await supabase.auth.signOut().catch(e => console.error("[Auth] Error signing out:", e));
        setSession(null);
        setUser(null);
        return false;
      }

      setAuthError(null);
      return true;
    } catch (error) {
      console.error("[Auth] Exception in syncUserProfile:", error);
      setAuthError('No se pudo validar tu usuario. Intenta más tarde.');
      
      // Defensive: Try to sign out even if it fails
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error("[Auth] Error signing out after exception:", signOutError);
      }
      
      setSession(null);
      setUser(null);
      return false;
    }
  };

  const checkAuth = async () => {
    // Defensive: Check if supabase exists
    if (!supabase) {
      console.warn("[Auth] checkAuth called but Supabase not configured");
      setIsAuthenticated(false);
      return;
    }

    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("[Auth] Error in checkAuth:", error);
        setIsAuthenticated(false);
        return;
      }
      
      if (currentSession) {
        setSession(currentSession);
        const ok = await syncUserProfile(currentSession.user);
        setIsAuthenticated(!!ok);
      } else {
        setIsAuthenticated(false);
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      console.error("[Auth] Exception in checkAuth:", error);
      setIsAuthenticated(false);
      setSession(null);
      setUser(null);
    }
  };

  const signInWithGoogle = async () => {
    // Defensive: Check if supabase exists
    if (!supabase) {
      console.error("[Auth] Google login failed - Supabase not configured");
      return { 
        success: false, 
        message: "Configuración de autenticación no disponible. Contacta al administrador." 
      };
    }

    try {
      const isWeb = typeof window !== 'undefined' && Platform.OS === 'web';
      const redirectTo = isWeb
        ? `${window.location.origin}/auth/callback`
        : 'hotelmanager://auth/callback';

      console.log("[Auth] Google OAuth redirectTo:", redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error("[Auth] OAuth error:", error);
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error("[Auth] Exception in Google sign-in:", error);
      
      // Provide user-friendly error messages
      let message = "Error en el inicio de sesión con Google";
      
      if (error.message?.includes('popup_closed')) {
        message = "Ventana de Google cerrada. Intenta nuevamente.";
      } else if (error.message?.includes('network')) {
        message = "Sin conexión a internet. Verifica tu conexión.";
      } else if (error.message) {
        message = error.message;
      }
      
      return { success: false, message };
    }
  };

  const signInWithEmail = async (email, password) => {
    // Defensive: Check if supabase exists
    if (!supabase) {
      console.error("[Auth] Email login failed - Supabase not configured");
      return { 
        success: false, 
        message: "Configuración de autenticación no disponible. Contacta al administrador." 
      };
    }

    // Defensive: Validate inputs
    if (!email || !password) {
      return {
        success: false,
        message: "Email y contraseña son requeridos"
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error("[Auth] Login error:", error);
        throw error;
      }

      // Defensive: Validate response structure
      if (!data || !data.session || !data.user) {
        console.error("[Auth] Invalid login response:", data);
        return {
          success: false,
          message: "Respuesta inválida del servidor. Intenta nuevamente."
        };
      }

      // CRITICAL: Wait for profile validation before returning success
      // This prevents the user from accessing the app if their profile is inactive
      setSession(data.session);
      const isValid = await syncUserProfile(data.user);
      
      if (!isValid) {
        // Profile validation failed (inactive user or missing profile)
        // authError was already set by syncUserProfile
        return { 
          success: false, 
          message: authError || "Tu usuario no está habilitado. Contacta al administrador."
        };
      }
      
      setIsAuthenticated(true);
      return { success: true, data };
      
    } catch (error) {
      console.error("[Auth] Exception in email sign-in:", error);
      let message = "Error en el inicio de sesión";

      const rawMsg = String(error?.message || "");
      const lower = rawMsg.toLowerCase();

      // Credenciales inválidas
      if (lower.includes("invalid login credentials") || lower.includes("invalid_credentials")) {
        message = "Email o contraseña incorrectos";
      }
      // Email no confirmado
      else if (lower.includes("email not confirmed")) {
        message = "Debes confirmar tu email antes de iniciar sesión";
      }
      // Problemas de red / conectividad
      else if (
        lower.includes("failed to fetch") ||
        lower.includes("network request failed") ||
        lower.includes("fetcherror") ||
        lower.includes("typeerror: network request failed")
      ) {
        message = "No se pudo conectar con el servicio de autenticación. Revisa tu conexión a internet.";
      }
      // Límite de intentos o políticas
      else if (lower.includes("too many requests") || lower.includes("rate limit")) {
        message = "Demasiados intentos. Intenta nuevamente en unos minutos.";
      }

      // Permitir modo debug opcional para ver el mensaje crudo de Supabase
      const showDebug = process.env.EXPO_PUBLIC_SHOW_AUTH_DEBUG === '1';
      const details = showDebug && rawMsg ? ` (detalle: ${rawMsg})` : '';

      return {
        success: false,
        message: `${message}${details}`,
      };
    }
  };

  const logout = async () => {
    // Defensive: Try to sign out even if supabase is null
    if (supabase) {
      try {
        await supabase.auth.signOut();
        console.log("[Auth] Signed out successfully");
      } catch (error) {
        console.error("[Auth] Error during logout:", error);
        // Continue anyway to clear local state
      }
    } else {
      console.warn("[Auth] Logout called but Supabase not configured");
    }
    
    // Always clear local state regardless of signOut success
    setSession(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
  };

  const updateUser = async (userData) => {
    setUser(userData);
  };

  // Get access token for API calls
  const getAccessToken = () => {
    return session?.access_token || null;
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated,
    authError,
    signInWithGoogle,
    signInWithEmail,
    logout,
    updateUser,
    checkAuth,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
