import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Modal, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DashboardLayout from '../components/Layout/DashboardLayout';
import UserList from '../components/UserManagement/UserList';
import UserForm from '../components/UserManagement/UserForm';
import UserStats from '../components/UserManagement/UserStats';
import ConfirmationModal from '../components/Common/ConfirmationModal';
import { usersAPI } from '../services/api';
import Card from '../components/ui/Card';
import { COLORS, SPACING } from '../styles/theme';

const UserManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async () => {
    try {
      const [activeRes, inactiveRes] = await Promise.all([
        usersAPI.getAll({ activo: 'true' }),
        usersAPI.getAll({ activo: 'false' }),
      ]);
      setUsers(activeRes.data.data || []);
      setInactiveUsers(inactiveRes.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const handleCreate = () => {
    setSelectedUser(null);
    setIsFormVisible(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsFormVisible(true);
  };

  const handleShowStats = (user) => {
    setSelectedUser(user);
    setIsStatsVisible(true);
  };

  const handleDeletePress = (user) => {
    setUserToDelete(user);
    setIsConfirmVisible(true);
  };

  const handleActivate = async (user) => {
    try {
      // Send update with same data but activo=true
      await usersAPI.update(user.id, { nombre: user.nombre, email: user.email, rol: user.rol, activo: true });
      fetchUsers();
    } catch (error) {
      console.error('Error activating user:', error.response?.data || error.message);
      Alert.alert('Error', 'No se pudo activar el usuario.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    console.log(`Attempting to delete user with ID: ${userToDelete.id}`);
    try {
      await usersAPI.delete(userToDelete.id);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error("Error deleting user:", error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Could not delete user. See console for details.');
    } finally {
      setIsConfirmVisible(false);
      setUserToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormVisible(false);
    fetchUsers(); // Refresh list
  };

  return (
    <DashboardLayout>
      <UserList 
        users={users}
        inactiveUsers={inactiveUsers}
        onEdit={handleEdit} 
        onDelete={handleDeletePress} 
        onShowStats={handleShowStats} 
        onCreate={handleCreate}
        onActivate={handleActivate}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={isFormVisible}
        onRequestClose={() => setIsFormVisible(false)}
      >
        <View style={styles.modalContainer}>
          <UserForm 
            user={selectedUser} 
            onSuccess={handleFormSuccess} 
            onCancel={() => setIsFormVisible(false)}
          />
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isStatsVisible}
        onRequestClose={() => setIsStatsVisible(false)}
      >
        <UserStats 
          user={selectedUser} 
          onClose={() => setIsStatsVisible(false)} 
        />
      </Modal>

      <ConfirmationModal
        visible={isConfirmVisible}
        message={`¿Estás seguro de que quieres desactivar a ${userToDelete?.nombre}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsConfirmVisible(false)}
      />
    </DashboardLayout>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalWrapper: {
    width: 'auto',
    maxWidth: '90%',
    marginHorizontal: SPACING.md,
    backgroundColor: 'transparent',
  },
});

export default UserManagementScreen;