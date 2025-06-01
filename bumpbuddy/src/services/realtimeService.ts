import supabase from '../config/supabaseConfig';

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
      // Enable realtime for this channel
      const subscription = supabase
        .channel('public:users')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'users' },
          payload => {
            if (onInsert) onInsert(payload);
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'users' },
          payload => {
            if (onUpdate) onUpdate(payload);
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'users' },
          payload => {
            if (onDelete) onDelete(payload);
          }
        )
        .subscribe();

      // Return the subscription object so it can be unsubscribed later
      return subscription;
    } catch (error) {
      console.error('Error setting up Users subscription:', error);
      if (onError) onError(error);
      return null;
    }
  },

  // Unsubscribe from a channel
  unsubscribe: (subscription: any) => {
    if (subscription) {
      try {
        supabase.removeChannel(subscription);
      } catch (error) {
        console.error('Error unsubscribing from channel:', error);
      }
    }
  },
};

export default realtimeService;
