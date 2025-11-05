import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDERS, FONT_SIZES } from '../../styles/theme';

const ConfirmationModal = ({ visible, message, onConfirm, onCancel }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
              <Text style={styles.buttonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '80%',
    maxWidth: 300,
    backgroundColor: COLORS.card,
    borderRadius: BORDERS.radius,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: BORDERS.borderWidth,
    borderColor: COLORS.border,
  },
  message: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.body,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: COLORS.secondary,
  },
  confirmButton: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

export default ConfirmationModal;