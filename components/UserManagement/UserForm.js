import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Switch, Platform } from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { Picker } from '@react-native-picker/picker';
import { usersAPI } from '../../services/api';
import { COLORS, SPACING, FONT_SIZES, BORDERS } from '../../styles/theme';

const UserForm = ({ user, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'recepcionista',
    activo: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre,
        email: user.email,
        password: '', // Password is not sent for editing
        rol: user.rol,
        activo: user.activo,
      });
      setIsEditing(true);
    } else {
      setIsEditing(false);
      setFormData({
        nombre: '',
        email: '',
        password: '',
        rol: 'recepcionista',
        activo: true,
      });
    }
  }, [user]);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await usersAPI.update(user.id, formData);
      } else {
        await usersAPI.create(formData);
      }
      setIsVisible(false);
      // Esperamos a que termine la animación antes de llamar a onSuccess
      setTimeout(onSuccess, 300);
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleCancel = () => {
    setIsVisible(false);
    setTimeout(onCancel, 300);
  };

  if (!isVisible) return null;

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      layout={Platform.OS !== 'web' ? Layout.springify() : undefined}
    >
      <Text style={styles.title}>{isEditing ? 'Edit User' : 'Create User'}</Text>
      
      <View>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor={COLORS.placeholder}
          value={formData.nombre}
          onChangeText={(value) => handleChange('nombre', value)}
        />
      </View>
      
      <View>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.placeholder}
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      
      {!isEditing && (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.placeholder}
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            secureTextEntry
          />
        </View>
      )}

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Role:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={formData.rol}
            onValueChange={(value) => handleChange('rol', value)}
            style={styles.picker}
            dropdownIconColor={COLORS.white}
          >
            <Picker.Item label="Recepcionista" value="recepcionista" color={COLORS.textPrimary} />
            <Picker.Item label="Supervisor" value="supervisor" color={COLORS.textPrimary} />
            <Picker.Item label="Admin" value="admin" color={COLORS.textPrimary} />
          </Picker>
        </View>
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Active</Text>
        <Switch
          value={formData.activo}
          onValueChange={(value) => handleChange('activo', value)}
        />
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDERS.radius,
    width: '90%',
    maxWidth: 600,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#f5f5f5',
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDERS.radius,
    marginBottom: SPACING.md,
    height: 48,
    justifyContent: 'center',
  },
  pickerContainer: {
    marginBottom: SPACING.md,
  },
  pickerWrapper: {
    backgroundColor: '#f5f5f5',
    borderRadius: BORDERS.radius,
    marginTop: SPACING.xs,
    overflow: 'hidden',
    height: 48,
  },
  picker: {
    backgroundColor: COLORS.background,
    color: COLORS.textPrimary,
    height: 50,
    marginTop: Platform.OS === 'android' ? -4 : 0,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: '#f5f5f5',
    borderRadius: BORDERS.radius,
    height: 48,
  },
  label: {
    color: COLORS.placeholder,
    fontSize: 14,
    marginBottom: SPACING.xs,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
  },
  button: {
    padding: SPACING.md,
    backgroundColor: '#1a3b8f',
    borderRadius: BORDERS.radius,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  cancelButton: {
    padding: SPACING.md,
    backgroundColor: '#1a3b8f',
    borderRadius: BORDERS.radius,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  buttonText: { 
    color: COLORS.white,
    fontSize: FONT_SIZES.button,
    fontWeight: '500',
  },
});

export default UserForm;