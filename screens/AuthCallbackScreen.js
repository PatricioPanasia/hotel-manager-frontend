import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import supabase from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../styles/theme';

export default function AuthCallbackScreen() {
  const navigation = useNavigation();
  const { checkAuth } = useAuth();

  useEffect(() => {
    let mounted = true;

    const finalize = async () => {
      try {
        // Supabase on native/web completes session automatically on redirect.
        // We just refresh our local state and go to the app.
        await checkAuth();
        // Give the state a moment to settle before navigating
        await new Promise(resolve => setTimeout(resolve, 300));
      } finally {
        if (mounted) {
          navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
        }
      }
    };

    finalize();
    return () => { mounted = false; };
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});
