
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

const ExpoSecureStoreAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(
  "https://gfwzalwdhgramkwdxlbq.supabase.co",
  "sb_publishable_L-wOKzhIj1yuKIkLqpz4wA_f-rBC3HZ",
    {
    auth: {
      storage: ExpoSecureStoreAdapter,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
)