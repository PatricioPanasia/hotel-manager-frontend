import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useAuth } from "../context/AuthContext";

import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { COLORS, SPACING } from '../styles/theme';

export default function LoginScreen() {
  const { signInWithGoogle, authError } = useAuth();

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
          <Text style={styles.subtitle}>Inicia sesión con Google para continuar</Text>
          {authError ? (
            <Text style={styles.error}>{authError}</Text>
          ) : null}

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
});
