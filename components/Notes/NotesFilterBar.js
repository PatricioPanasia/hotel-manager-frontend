import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { COLORS, SPACING, BORDERS, FONT_SIZES } from '../../styles/theme';

const FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'important', label: 'Importantes' },
  { key: 'personal', label: 'Personales' },
];

const NotesFilterBar = ({ activeFilter, setActiveFilter }) => {
  const { device } = useResponsive();

  const containerStyle = device === 'mobile' ? styles.containerMobile : styles.containerDesktop;

  return (
    <View style={[styles.container, containerStyle]}>
      {FILTERS.map(({ key, label }) => {
        const isActive = activeFilter === key;
        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterButton,
              isActive && styles.activeFilterButton,
              device === 'mobile' && styles.filterButtonMobile
            ]}
            onPress={() => setActiveFilter(key)}
          >
            <Text style={[styles.buttonText, isActive && styles.activeButtonText]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    flexDirection: 'row',
    gap: 12,
  },
  containerDesktop: {
    justifyContent: 'flex-start',
  },
  containerMobile: {
    flexDirection: 'column',
  },
  filterButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.borderWidth,
    borderColor: COLORS.border,
  },
  filterButtonMobile: {
    width: '100%',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  buttonText: {
    color: COLORS.placeholder,
    fontWeight: '600',
  },
  activeButtonText: {
    color: COLORS.white,
  },
});

export default NotesFilterBar;
