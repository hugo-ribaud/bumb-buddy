import supabase from "../config/supabaseConfig";

// Define types
interface RealtimeSubscriptionParams {
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  onError?: (error: any) => void;
}

// Realtime service
const realtimeService = {
  // Subscribe to changes on the Users table
  subscribeToUsers: ({
    onInsert,
    onUpdate,
    onDelete,
    onError,
  }: RealtimeSubscriptionParams) => {
    try {
      console.log("Setting up Users table subscription...");

      // Enable realtime for this channel
      const subscription = supabase
        .channel("public:users")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "users" },
          (payload) => {
            console.log("User INSERT event:", payload);
            if (onInsert) onInsert(payload);
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "users" },
          (payload) => {
            console.log("User UPDATE event:", payload);
            if (onUpdate) onUpdate(payload);
          }
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "users" },
          (payload) => {
            console.log("User DELETE event:", payload);
            if (onDelete) onDelete(payload);
          }
        )
        .subscribe((status) => {
          console.log("Users subscription status:", status);
        });

      // Return the subscription object so it can be unsubscribed later
      return subscription;
    } catch (error) {
      console.error("Error setting up Users subscription:", error);
      if (onError) onError(error);
      return null;
    }
  },

  // Unsubscribe from a channel
  unsubscribe: (subscription: any) => {
    if (subscription) {
      try {
        supabase.removeChannel(subscription);
        console.log("Unsubscribed from channel");
      } catch (error) {
        console.error("Error unsubscribing from channel:", error);
      }
    }
  },
};

export default realtimeService;
