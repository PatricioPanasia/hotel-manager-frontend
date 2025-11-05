import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../styles/theme';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import NotesScreen from '../screens/NotesScreen';
import TasksScreen from '../screens/TasksScreen';
import AttendancePageScreen from '../screens/AttendancePageScreen';
import UserManagementScreen from '../screens/UserManagementScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AuthCallbackScreen from '../screens/AuthCallbackScreen';

// Tabs: we hide text labels and show only icons (vector icons from @expo/vector-icons).
// If you prefer emojis, replace MaterialCommunityIcons with Text emoji elements.
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="AuthCallback" component={AuthCallbackScreen} />
    </Stack.Navigator>
  );
}

function MainTabs({ role }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: `${COLORS.white}99`,
        tabBarStyle: {
          backgroundColor: COLORS.primary,
          borderTopWidth: 0,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          paddingBottom: 4,
          color: COLORS.white,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home-outline" color={color} size={size} />,
        }}
      />

      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="format-list-checkbox" color={color} size={size} />,
        }}
      />

      <Tab.Screen
        name="Notes"
        component={NotesScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="note-outline" color={color} size={size} />,
        }}
      />

      <Tab.Screen
        name="Attendance"
        component={AttendancePageScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="clock-outline" color={color} size={size} />,
        }}
      />

      {(role === 'admin' || role === 'supervisor') && (
        <Tab.Screen
          name="Users"
          component={UserManagementScreen}
          options={{
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-group-outline" color={color} size={size} />,
          }}
        />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading, user } = useAuth();
  const prefixes = ['hotelmanager://'];
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    prefixes.push(window.location.origin);
  }

  const linking = {
    prefixes,
    config: {
      screens: {
        Dashboard: '',
        Tasks: 'tasks',
        Notes: 'notes',
        Attendance: 'attendance',
        Users: 'users',
        AuthCallback: 'auth/callback',
      },
    },
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      {isAuthenticated ? <MainTabs role={user?.rol} /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
