import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { COLORS, SPACING } from '../styles/theme';

export default function RegisterScreen(){ 
  const { register } = useAuth();
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }
    const result = await register({ name, email, password });
    if (!result.success) {
      Alert.alert("Error de registro", result.message || "No se pudo completar el registro.");
    }
    // Si el registro es exitoso, AppNavigator cambiará la pantalla automáticamente.
  };

  return (
    <ScrollView contentContainerStyle={styles.outerContainer}>
      <View style={styles.wrapper}>
        <Card>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Input
            placeholder="Nombre completo"
            value={name}
            onChangeText={setName}
          />

          <View style={{ height: SPACING.sm }} />

          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={{ height: SPACING.sm }} />

          <Input
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View style={{ height: SPACING.md }} />

          <Button title="Registrarse" onPress={handleRegister} />

          <View style={{ height: SPACING.md }} />

          <Button title="¿Ya tienes una cuenta? Inicia sesión" onPress={() => navigation.navigate('Login')} variant="secondary" />
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flexGrow: 1, backgroundColor: COLORS.background, justifyContent: "center", alignItems: 'center', padding: SPACING.md },
  wrapper: { width: '100%', maxWidth: 420 },
  title: { fontSize: 28, color: COLORS.primary, marginBottom: SPACING.lg, textAlign: "center", fontWeight: "700" },
});
