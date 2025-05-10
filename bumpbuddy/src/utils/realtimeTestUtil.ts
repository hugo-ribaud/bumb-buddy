import supabase from "../config/supabaseConfig";

/**
 * Utility functions to help test Supabase Realtime in development
 * These functions simulate database changes without requiring the actual backend
 */
const realtimeTestUtil = {
  /**
   * Simulate a user profile update to test Realtime subscription
   * @param userId User ID to update
   * @param data New user data
   */
  simulateUserUpdate: async (userId: string, data: any) => {
    try {
      console.log("Simulating user update:", { userId, data });

      // In a real app, this would update the database
      // For testing, we're just simulating the database change

      // Create a payload similar to what Supabase Realtime would send
      const payload = {
        schema: "public",
        table: "users",
        commit_timestamp: new Date().toISOString(),
        eventType: "UPDATE",
        new: {
          id: userId,
          ...data,
          // Standard Supabase fields
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        old: {
          id: userId,
        },
      };

      // If connected to a real Supabase instance with database access,
      // uncomment this to actually update the database
      /*
      const { error } = await supabase
        .from('users')
        .update({
          due_date: data.due_date,
          pregnancy_week: data.pregnancy_week,
        })
        .eq('id', userId);
        
      if (error) {
        console.error('Error updating user:', error);
      }
      */

      return { success: true, payload };
    } catch (error) {
      console.error("Error simulating user update:", error);
      return { success: false, error };
    }
  },

  /**
   * Manually test if Realtime can broadcast a message
   */
  testBroadcast: async () => {
    try {
      console.log("Testing Realtime broadcast...");

      const channel = supabase.channel("test-channel");

      const subscription = channel
        .on("broadcast", { event: "test" }, (payload) => {
          console.log("Received broadcast:", payload);
        })
        .subscribe();

      // Wait a moment to ensure subscription is active
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Send a test message
      await channel.send({
        type: "broadcast",
        event: "test",
        payload: {
          message: "This is a test message",
          timestamp: new Date().toISOString(),
        },
      });

      console.log("Test broadcast sent");

      // Return the subscription so it can be cleaned up
      return { success: true, channel, subscription };
    } catch (error) {
      console.error("Error testing broadcast:", error);
      return { success: false, error };
    }
  },
};

export default realtimeTestUtil;
