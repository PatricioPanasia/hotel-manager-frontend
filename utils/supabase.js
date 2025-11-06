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
  console.log('[Supabase] Configuration check:');
  console.log('  - URL configured:', !!SUPABASE_URL);
  console.log('  - Key configured:', !!SUPABASE_ANON_KEY);
  console.log('  - URL value:', SUPABASE_URL ? `${SUPABASE_URL.substring(0, 30)}...` : 'MISSING');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('⚠️  [Supabase] CRITICAL: Missing environment variables!');
    console.error('  Check eas.json or app.config.js for EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  }
}

// Defensive: Validate URL format
let clientCreationError = null;
if (SUPABASE_URL && !SUPABASE_URL.startsWith('http')) {
  clientCreationError = 'Invalid Supabase URL format';
  console.error('[Supabase] Invalid URL format:', SUPABASE_URL);
}

// Create a singleton client with auth options for OAuth and session persistence
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY && !clientCreationError
  ? (() => {
      try {
        const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
          },
        });
        
        if (__DEV__) {
          console.log('✅ [Supabase] Client created successfully');
        }
        
        return client;
      } catch (error) {
        console.error('❌ [Supabase] Error creating client:', error);
        return null;
      }
    })()
  : null;

// Warn if client is not configured
if (!supabase) {
  console.error('❌ [Supabase] Client not configured. Authentication will not work.');
  if (__DEV__) {
    console.error('  Possible causes:');
    console.error('  1. Missing EXPO_PUBLIC_SUPABASE_URL in eas.json or app.config.js');
    console.error('  2. Missing EXPO_PUBLIC_SUPABASE_ANON_KEY in eas.json or app.config.js');
    console.error('  3. Invalid URL format');
    if (clientCreationError) {
      console.error('  4. Error:', clientCreationError);
    }
  }
}

export default supabase;
