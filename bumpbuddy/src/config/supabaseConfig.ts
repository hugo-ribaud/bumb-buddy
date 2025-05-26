import { EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_SUPABASE_URL } from "@env";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Configure with AsyncStorage for persistent sessions
const supabase = createClient(
  EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    // Re-enable Realtime now that we have the Metro config workaround
    // Using minimal config to avoid type errors with varying Supabase versions
  }
);

// Initialize Realtime
const initRealtime = async () => {
  try {
    // Test connection
    const { error } = await supabase
      .from("users")
      .select("count", { count: "exact", head: true });
    if (error) {
      console.error("Supabase connection test failed:", error.message);
    }
  } catch (error) {
    console.error("Error initializing Realtime:", error);
  }
};

// Call the initialization function
initRealtime();

export default supabase;
