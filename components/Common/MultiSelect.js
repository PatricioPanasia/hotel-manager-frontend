import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { COLORS, SPACING, BORDERS, FONT_SIZES } from '../../styles/theme';

const MultiSelect = ({ label, options, selectedValues, onSelectionChange, containerStyle }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (value) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];
    onSelectionChange(newSelection);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleSelect(item.id)}>
      <View style={[styles.checkbox, selectedValues.includes(item.id) && styles.checkboxSelected]} />
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={containerStyle}> 
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText} numberOfLines={1}>
          {selectedValues.length > 0 ? `${selectedValues.length} seleccionados` : 'Todos'}
        </Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)} />
        <View style={styles.modalContent}>
          <FlatList
            data={options}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: { 
    color: COLORS.placeholder, 
    fontSize: FONT_SIZES.body, 
    marginBottom: SPACING.xs 
  },
  button: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radius,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    borderWidth: BORDERS.borderWidth,
    borderColor: COLORS.border,
  },
  buttonText: {
    color: COLORS.textPrimary,
    flex: 1,
  },
  dropdownIcon: {
    color: COLORS.placeholder,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: BORDERS.cardRadius,
    borderTopRightRadius: BORDERS.cardRadius,
    padding: SPACING.md,
    maxHeight: '50%',
    borderTopWidth: BORDERS.borderWidth,
    borderTopColor: COLORS.border,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.accent,
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: COLORS.accent,
  },
  itemText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.body,
  },
  closeButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.accent,
    padding: SPACING.sm,
    borderRadius: BORDERS.radius,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

export default MultiSelect;