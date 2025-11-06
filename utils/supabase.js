// Minimal Supabase client for web/native. Keys are provided via Expo public env vars.
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Use Constants.expoConfig.extra for native builds, process.env for web
const SUPABASE_URL = 
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || 
  process.env.EXPO_PUBLIC_SUPABASE_URL;

const SUPABASE_ANON_KEY = 
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Debug: Log configuration status (only in dev)
if (__DEV__) {
  console.log('[Supabase] URL configured:', !!SUPABASE_URL);
  console.log('[Supabase] Key configured:', !!SUPABASE_ANON_KEY);
}

// Create a singleton client with auth options for OAuth and session persistence
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Warn if client is not configured
if (!supabase && __DEV__) {
  console.error('[Supabase] Client not configured. Check environment variables.');
}

export default supabase;
