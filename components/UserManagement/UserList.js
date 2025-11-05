import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDERS } from '../../styles/theme';
import Button from '../ui/Button';

const UserItem = ({ item, onEdit, onDelete, onShowStats, onActivate, isInactive }) => (
  <View style={styles.itemContainer}>
    <View style={styles.userInfoContainer}>
      <Text style={styles.itemText}>{item.nombre}</Text>
      <Text style={styles.itemSubText}>{item.email} - {item.rol}</Text>
    </View>
    <View style={styles.buttonsContainer}>
      <TouchableOpacity style={styles.button} onPress={() => onShowStats(item)}>
        <Text style={styles.buttonText}>Estadísticas</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => onEdit(item)}>
        <Text style={styles.buttonText}>Editar</Text>
      </TouchableOpacity>
      {isInactive ? (
        <TouchableOpacity 
          style={[styles.button, styles.activateButton]}
          onPress={() => onActivate(item)}
        >
          <Text style={styles.buttonText}>Activar</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={[styles.button, styles.deleteButton]}
          onPress={() => onDelete(item)}
        >
          <Text style={styles.buttonText}>Eliminar</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const UserList = ({ users, inactiveUsers = [], onEdit, onDelete, onShowStats, onCreate, onActivate }) => {
  const [showInactive, setShowInactive] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestor de usuarios</Text>
        <Button title="Crear Usuario" onPress={onCreate} style={styles.createButton} />
      </View>

      <FlatList
        data={users}
        renderItem={({ item }) => <UserItem item={item} onEdit={onEdit} onDelete={onDelete} onShowStats={onShowStats} />}
        keyExtractor={(item) => item.id.toString()}
      />

      <TouchableOpacity style={styles.inactiveHeader} onPress={() => setShowInactive(prev => !prev)}>
        <Text style={styles.inactiveHeaderText}>Usuarios inactivos ({inactiveUsers.length}) {showInactive ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {showInactive && (
        <FlatList
          data={inactiveUsers}
          renderItem={({ item }) => <UserItem item={item} isInactive onEdit={onEdit} onActivate={onActivate} onShowStats={onShowStats} />}
          keyExtractor={(item) => `inactive-${item.id}`}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.h2,
    color: COLORS.textPrimary,
  },
  createButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDERS.radius,
  },
  itemContainer: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: BORDERS.cardRadius,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: BORDERS.borderWidth,
    borderColor: COLORS.border,
  },
  userInfoContainer: {
    flex: 1,
    flexShrink: 1,
    marginRight: SPACING.sm,
  },
  itemText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
  },
  itemSubText: {
    color: COLORS.placeholder,
    flexWrap: 'wrap',
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  button: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDERS.radius / 2,
    marginLeft: SPACING.sm,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  activateButton: {
    backgroundColor: COLORS.success,
  },
  inactiveHeader: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDERS.radius,
    marginBottom: SPACING.sm,
  },
  inactiveHeaderText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.caption,
  },
});

export default UserList;