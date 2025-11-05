import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { COLORS, SPACING, BORDERS, FONT_SIZES } from '../../styles/theme';

const CustomSelect = ({ label, data, selectedValue, onValueChange, displayField = 'label', valueField = 'value', placeholder, containerStyle }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const selectedItem = data.find(item => item[valueField] === selectedValue);

  useEffect(() => {
    if (modalVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [modalVisible, fadeAnim]);

  const handleSelect = (value) => {
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.inputContainer} onPress={() => setModalVisible(true)}>
        <Text style={styles.inputText(!!selectedItem)}>
          {selectedItem ? selectedItem[displayField] : (placeholder || `Seleccionar ${label?.toLowerCase()}`)}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalBackdrop} onPress={() => setModalVisible(false)} activeOpacity={1}>
          <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
            <FlatList
              data={data}
              keyExtractor={(item) => String(item[valueField])}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pickerItem}
                  onPress={() => handleSelect(item[valueField])}
                >
                  <Text style={styles.pickerItemText}>{item[displayField]}</Text>
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    color: COLORS.placeholder,
    fontSize: FONT_SIZES.body,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    backgroundColor: COLORS.card,
    borderRadius: BORDERS.radius,
    marginBottom: SPACING.md,
    height: 48,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    borderWidth: BORDERS.borderWidth,
    borderColor: COLORS.border,
  },
  inputText: (isSelected) => ({
    color: isSelected ? COLORS.textPrimary : COLORS.placeholder,
    fontSize: FONT_SIZES.body,
  }),
  arrow: {
    color: COLORS.placeholder,
    fontSize: FONT_SIZES.caption,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    width: '80%',
    borderRadius: BORDERS.radius,
    maxHeight: '60%',
    borderColor: COLORS.border,
    borderWidth: BORDERS.borderWidth,
  },
  pickerItem: {
    padding: SPACING.md,
    borderBottomWidth: BORDERS.borderWidth,
    borderBottomColor: COLORS.border,
  },
  pickerItemText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.body,
    textAlign: 'center',
  },
});

export default CustomSelect;
