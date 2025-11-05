import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDERS, FONT_SIZES } from '../../styles/theme';

const AlertModal = ({ 
  visible, 
  title, 
  message, 
  onClose, 
  type = 'info' // 'info', 'success', 'error', 'warning'
}) => {
  const getTypeColor = () => {
    switch(type) {
      case 'success': return COLORS.success;
      case 'error': return COLORS.error;
      case 'warning': return COLORS.accent;
      default: return COLORS.primary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {title && (
            <View style={[styles.titleContainer, { backgroundColor: getTypeColor() }]}>
              <Text style={styles.title}>{title}</Text>
            </View>
          )}
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{message}</Text>
          </View>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: getTypeColor() }]} 
              onPress={onClose}
            >
              <Text style={styles.buttonText}>OK</Text>
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
    width: '85%',
    maxWidth: 400,
    backgroundColor: COLORS.card,
    borderRadius: BORDERS.radius,
    overflow: 'hidden',
    borderWidth: BORDERS.borderWidth,
    borderColor: COLORS.border,
  },
  titleContainer: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: FONT_SIZES.h3,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  messageContainer: {
    padding: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  message: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonsContainer: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: BORDERS.radius,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.button,
  },
});

export default AlertModal;
