import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// We can't import directly from @env because it requires .env file to be present
// For now, we'll use fallback values and update this later when .env is properly set up

// Environment variables (will be replaced by actual values when .env is set up)
const supabaseUrl = process.env.SUPABASE_URL || "http://localhost:54321";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "placeholder-anon-key";

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
