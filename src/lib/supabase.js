import { createClient } from '@supabase/supabase-js';

// Supabase environment variables - NO hardcoded fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if valid user Supabase credentials are set BEFORE initialization
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Initialize Supabase Client only if credentials are available
export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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
  if (isSupabaseConfigured() && supabase) {
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
  if (isSupabaseConfigured() && supabase) {
    supabaseChannel = supabase
      .channel('public:realtime_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (onEventReceived) {
            onEventReceived({ type: 'ORDER_UPDATED', payload: payload.new || payload.old });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kot_tickets' },
        (payload) => {
          if (onEventReceived) {
            onEventReceived({ type: 'KOT_UPDATED', payload: payload.new || payload.old });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        (payload) => {
          if (onEventReceived) {
            onEventReceived({ type: 'ORDER_ITEM_UPDATED', payload: payload.new || payload.old });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'restaurant_tables' },
        (payload) => {
          if (onEventReceived) {
            onEventReceived({ type: 'TABLE_UPDATED', payload: payload.new || payload.old });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        (payload) => {
          if (onEventReceived) {
            onEventReceived({ type: 'MENU_ITEM_UPDATED', payload: payload.new || payload.old });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_events' },
        (payload) => {
          if (onEventReceived) {
            onEventReceived({ type: 'LIVE_EVENT', payload: payload.new });
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
    if (supabaseChannel && supabase) {
      supabase.removeChannel(supabaseChannel);
    }
  };
};

/**
 * Fetch all orders from Supabase
 */
export const fetchOrders = async () => {
  if (!isSupabaseConfigured() || !supabase) return [];
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        menu_item_id,
        quantity,
        unit_price,
        special_instructions,
        status
      )
    `)
    .order('created_at', { ascending: false });
  if (error) console.error('Error fetching orders:', error);
  return data || [];
};

/**
 * Fetch all menu items from Supabase
 */
export const fetchMenuItems = async () => {
  if (!isSupabaseConfigured() || !supabase) return [];
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('name', { ascending: true });
  if (error) console.error('Error fetching menu items:', error);
  return data || [];
};

/**
 * Fetch available menu items from Supabase
 */
export const fetchAvailableMenuItems = async () => {
  if (!isSupabaseConfigured() || !supabase) return [];
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_available', true)
    .order('name', { ascending: true });
  if (error) console.error('Error fetching available menu items:', error);
  return data || [];
};

/**
 * Fetch all restaurant tables from Supabase
 */
export const fetchTables = async () => {
  if (!isSupabaseConfigured() || !supabase) return [];
  const { data, error } = await supabase
    .from('restaurant_tables')
    .select('*')
    .order('table_number', { ascending: true });
  if (error) console.error('Error fetching tables:', error);
  return data || [];
};

/**
 * Create a new order in Supabase
 */
export const createOrder = async (orderData) => {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();
  if (error) console.error('Error creating order:', error);
  return data;
};

/**
 * Create order items in Supabase
 */
export const createOrderItems = async (items) => {
  if (!isSupabaseConfigured() || !supabase) return [];
  const { data, error } = await supabase
    .from('order_items')
    .insert(items)
    .select();
  if (error) console.error('Error creating order items:', error);
  return data || [];
};

/**
 * Update order status in Supabase
 */
export const updateOrderStatus = async (orderId, status) => {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();
  if (error) console.error('Error updating order status:', error);
  return data;
};

/**
 * Update order payment status in Supabase
 */
export const updateOrderPayment = async (orderId, paymentMethod, paymentStatus) => {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { data, error } = await supabase
    .from('orders')
    .update({ 
      payment_method: paymentMethod, 
      payment_status: paymentStatus,
      updated_at: new Date().toISOString() 
    })
    .eq('id', orderId)
    .select()
    .single();
  if (error) console.error('Error updating order payment:', error);
  return data;
};

/**
 * Create KOT ticket in Supabase
 */
export const createKOTTicket = async (kotData) => {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { data, error } = await supabase
    .from('kot_tickets')
    .insert([kotData])
    .select()
    .single();
  if (error) console.error('Error creating KOT ticket:', error);
  return data;
};

/**
 * Update KOT ticket status in Supabase
 */
export const updateKOTStatus = async (kotId, status) => {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { data, error } = await supabase
    .from('kot_tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', kotId)
    .select()
    .single();
  if (error) console.error('Error updating KOT status:', error);
  return data;
};

/**
 * Fetch KOT tickets from Supabase
 */
export const fetchKOTTickets = async () => {
  if (!isSupabaseConfigured() || !supabase) return [];
  const { data, error } = await supabase
    .from('kot_tickets')
    .select('*')
    .in('status', ['pending', 'preparing'])
    .order('created_at', { ascending: true });
  if (error) console.error('Error fetching KOT tickets:', error);
  return data || [];
};

/**
 * Update table status in Supabase
 */
export const updateTableStatus = async (tableId, status) => {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { data, error } = await supabase
    .from('restaurant_tables')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', tableId)
    .select()
    .single();
  if (error) console.error('Error updating table status:', error);
  return data;
};

/**
 * Create or update menu item in Supabase
 */
export const upsertMenuItem = async (menuItem) => {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { data, error } = await supabase
    .from('menu_items')
    .upsert(menuItem, { onConflict: 'id' })
    .select()
    .single();
  if (error) console.error('Error upserting menu item:', error);
  return data;
};

/**
 * Delete menu item from Supabase
 */
export const deleteMenuItem = async (menuItemId) => {
  if (!isSupabaseConfigured() || !supabase) return false;
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', menuItemId);
  if (error) {
    console.error('Error deleting menu item:', error);
    return false;
  }
  return true;
};

/**
 * Toggle menu item availability in Supabase
 */
export const toggleMenuItemAvailability = async (menuItemId, isAvailable) => {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { data, error } = await supabase
    .from('menu_items')
    .update({ 
      is_available: isAvailable, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', menuItemId)
    .select()
    .single();
  if (error) console.error('Error toggling menu item availability:', error);
  return data;
};

/**
 * Fetch pending bills from Supabase
 */
export const fetchPendingBills = async () => {
  if (!isSupabaseConfigured() || !supabase) return [];
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        menu_item_id,
        quantity,
        unit_price,
        special_instructions,
        status
      )
    `)
    .eq('payment_status', 'pending')
    .order('created_at', { ascending: false });
  if (error) console.error('Error fetching pending bills:', error);
  return data || [];
};
