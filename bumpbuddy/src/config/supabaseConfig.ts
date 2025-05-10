import { EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_SUPABASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Configure with AsyncStorage for persistent sessions
const supabase = createClient(
  EXPO_PUBLIC_SUPABASE_URL || "http://localhost:54321",
  EXPO_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
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

// Initialize Realtime for testing
const initRealtime = async () => {
  try {
    console.log("Initializing Supabase Realtime...");
    // Test connection
    const { error } = await supabase
      .from("users")
      .select("count", { count: "exact", head: true });
    if (error) {
      console.error("Supabase connection test failed:", error.message);
    } else {
      console.log(
        "Supabase connection successful, Realtime should be available"
      );
    }
  } catch (error) {
    console.error("Error initializing Realtime:", error);
  }
};

// Call the initialization function
initRealtime();

export default supabase;
