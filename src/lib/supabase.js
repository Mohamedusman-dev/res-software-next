import { createClient } from '@supabase/supabase-js';

// Supabase environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummykey';

// Initialize Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if valid user Supabase credentials are set
export const isSupabaseConfigured = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://xyzcompany.supabase.co' &&
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
};

// Fallback Live Real-time Broadcast Channel for multi-tab / local network sync
const liveBroadcastChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('pos_realtime_sync')
    : null;

/**
 * Broadcast an event to all live terminals (Waiter, Cashier, Kitchen)
 */
export const broadcastLiveEvent = (eventType, payload) => {
  if (liveBroadcastChannel) {
    liveBroadcastChannel.postMessage({ type: eventType, payload, timestamp: Date.now() });
  }

  // Also write to Supabase if configured
  if (isSupabaseConfigured()) {
    supabase
      .from('live_events')
      .insert([{ event_type: eventType, payload, created_at: new Date().toISOString() }])
      .then(({ error }) => {
        if (error) console.log('Supabase event sync error:', error.message);
      });
  }
};

/**
 * Subscribe to Live Real-time Sync updates
 */
export const subscribeToLiveSync = (onEventReceived) => {
  // 1. BroadcastChannel Listener (Instant local tab sync)
  const handleBroadcastMessage = (event) => {
    if (event.data && onEventReceived) {
      onEventReceived(event.data);
    }
  };

  if (liveBroadcastChannel) {
    liveBroadcastChannel.addEventListener('message', handleBroadcastMessage);
  }

  // 2. Supabase Real-time Postgres Changes Subscription
  let supabaseChannel = null;
  if (isSupabaseConfigured()) {
    supabaseChannel = supabase
      .channel('public:orders_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (onEventReceived) {
            onEventReceived({ type: 'KOT_PUNCHED', payload: payload.new || payload.old });
          }
        }
      )
      .subscribe();
  }

  // Return unsubscribe cleanup function
  return () => {
    if (liveBroadcastChannel) {
      liveBroadcastChannel.removeEventListener('message', handleBroadcastMessage);
    }
    if (supabaseChannel) {
      supabase.removeChannel(supabaseChannel);
    }
  };
};
