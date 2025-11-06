import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";

import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { COLORS, SPACING } from '../styles/theme';

export default function LoginScreen() {
  const { signInWithGoogle, signInWithEmail, authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    const result = await signInWithEmail(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      Alert.alert("Error de inicio de sesión", result.message || "No se pudo iniciar sesión.");
    }
  };

  const handleGoogleLogin = async () => {
    const result = await signInWithGoogle();
    if (!result.success) {
      Alert.alert("Error de inicio de sesión", result.message || "No se pudo iniciar sesión con Google.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.outerContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.wrapper}>
        <Card>
          <Text style={styles.title}>Hotel Manager</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          {authError ? (
            <Text style={styles.error}>{authError}</Text>
          ) : null}

          {/* Email/Password Form */}
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Button
            title={loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            onPress={handleEmailLogin}
            disabled={loading}
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
            style={{ backgroundColor: COLORS.google }}
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
  title: {
    fontSize: 28,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  error: {
    fontSize: 13,
    color: COLORS.error,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
