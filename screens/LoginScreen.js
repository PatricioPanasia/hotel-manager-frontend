import React, { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput } from "react-native";
import { useAuth } from "../context/AuthContext";

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { COLORS, SPACING, BORDERS } from '../styles/theme';

export default function LoginScreen() {
  const { signInWithGoogle, signInWithEmail, authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleEmailLogin = async () => {
    // Clear previous errors
    setLocalError(null);

    // Validate inputs
    if (!email || !password) {
      setLocalError("Por favor completa todos los campos");
      return;
    }

    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      setLocalError("El email no puede estar vacío");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setLocalError("Por favor ingresa un email válido");
      return;
    }

    // Password length validation
    if (password.length < 6) {
      setLocalError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    
    try {
      const result = await signInWithEmail(trimmedEmail, password);
      
      if (!result) {
        setLocalError("Error inesperado. Intenta nuevamente.");
        return;
      }
      
      if (!result.success) {
        setLocalError(result.message || "No se pudo iniciar sesión.");
      }
      // On success, navigation happens automatically via AuthContext
    } catch (error) {
      console.error("[LoginScreen] Exception during login:", error);
      setLocalError("Error inesperado. Verifica tu conexión e intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError(null);
    
    try {
      const result = await signInWithGoogle();
      
      if (!result) {
        setLocalError("Error inesperado con Google. Intenta nuevamente.");
        return;
      }
      
      if (!result.success) {
        setLocalError(result.message || "No se pudo iniciar sesión con Google.");
      }
    } catch (error) {
      console.error("[LoginScreen] Exception during Google login:", error);
      setLocalError("Error inesperado. Verifica tu conexión e intenta nuevamente.");
    }
  };

  // Show either authError from context (profile validation) or localError (login validation)
  const displayError = authError || localError;

  return (
    <KeyboardAvoidingView
      style={styles.outerContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.wrapper}>
        <Card style={styles.card}>
          <Text style={styles.title}>Hotel Manager</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          
          {displayError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.error}>{displayError}</Text>
            </View>
          ) : null}

          {/* Email Input with Icon */}
          <View style={[styles.inputContainer, emailFocused && styles.inputContainerFocused]}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.placeholder}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setLocalError(null); // Clear error when user starts typing
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          {/* Password Input with Icon and Toggle */}
          <View style={[styles.inputContainer, passwordFocused && styles.inputContainerFocused]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={COLORS.placeholder}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setLocalError(null); // Clear error when user starts typing
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          <Button
            title={loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            onPress={handleEmailLogin}
            disabled={loading}
            style={styles.loginButton}
          />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Login */}
          <Button
            title="Iniciar Sesión con Google"
            onPress={handleGoogleLogin}
            style={styles.googleButton}
          />
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  wrapper: {
    width: '100%',
    maxWidth: 420,
  },
  card: {
    padding: SPACING.xl,
  },
  title: {
    fontSize: 32,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee',
    padding: SPACING.md,
    borderRadius: BORDERS.radius,
    borderWidth: 1,
    borderColor: COLORS.error,
    marginBottom: SPACING.md,
  },
  errorIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  error: {
    flex: 1,
    fontSize: 13,
    color: COLORS.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    height: 54,
    borderWidth: 2,
    borderColor: '#e1e4e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#fff',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  eyeIcon: {
    fontSize: 20,
  },
  loginButton: {
    marginTop: SPACING.sm,
    height: 54,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e4e8',
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#DB4437',
    height: 54,
    borderRadius: 12,
    shadowColor: '#DB4437',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
});
