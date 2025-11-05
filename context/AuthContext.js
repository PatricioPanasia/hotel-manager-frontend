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
        console.warn("Supabase client not configured");
        setLoading(false);
        return;
      }

      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          const ok = await syncUserProfile(currentSession.user);
          setIsAuthenticated(!!ok);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    initSession();

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
      };
    }
  }, []);

  const syncUserProfile = async (authUser) => {
    if (!authUser) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        // If profile not found or error, deny access
        setAuthError('Tu usuario no está habilitado. Contacta al administrador.');
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        return false;
      }

      setUser({
        id: profile.id,
        email: profile.email,
        nombre: profile.nombre,
        rol: profile.rol,
        activo: profile.activo,
      });

      if (!profile.activo) {
        setAuthError('Tu usuario aún no fue habilitado. Contacta al administrador.');
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        return false;
      }

      setAuthError(null);
      return true;
    } catch (error) {
      console.error("Error syncing user profile:", error);
      setAuthError('No se pudo validar tu usuario. Intenta más tarde.');
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      return false;
    }
  };

  const checkAuth = async () => {
    if (!supabase) return;

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        setSession(currentSession);
        const ok = await syncUserProfile(currentSession.user);
        setIsAuthenticated(!!ok);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      setIsAuthenticated(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!supabase) {
      return { success: false, message: "Supabase not configured" };
    }

    try {
      const isWeb = typeof window !== 'undefined' && Platform.OS === 'web';
      const redirectTo = isWeb
        ? `${window.location.origin}/auth/callback`
        : 'hotelmanager://auth/callback';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: false,
        },
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error("Error Google sign-in:", error);
      return {
        success: false,
        message: error.message || "Error en el inicio de sesión con Google",
      };
    }
  };

  const logout = async () => {
    if (!supabase) return;

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
    }
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
