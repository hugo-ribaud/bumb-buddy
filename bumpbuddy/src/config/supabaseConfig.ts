import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Replace with your Supabase URL and anon key
const supabaseUrl = "SUPABASE_URL";
const supabaseKey = "SUPABASE_ANON_KEY";

// Configure with AsyncStorage for persistent sessions
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
