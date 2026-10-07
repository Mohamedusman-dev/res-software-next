/*
 # Restaurant POS Database Schema Migration
 Creates complete database structure for Mr. Mango Restaurant POS system

 ## Query Description: 
 This migration creates the foundational database schema for a multi-terminal restaurant POS system.
 It establishes tables for user profiles, menu management, table tracking, orders, KOT tickets, and real-time sync.
 All tables include Row Level Security policies for secure multi-terminal access.

 ## Metadata:
 - Schema-Category: Structural
 - Impact-Level: High
 - Requires-Backup: false
 - Reversible: true

 ## Structure Details:
 - profiles: User accounts linked to Supabase auth
 - menu_items: Restaurant menu with categories and pricing
 - restaurant_tables: Physical table management
 - orders: Customer orders with auto-generated order numbers
 - order_items: Individual items within orders
 - kot_tickets: Kitchen Order Tickets for kitchen display
 - live_events: Real-time event sync across terminals

 ## Security Implications:
 - RLS Status: Enabled on all tables
 - Policy Changes: Yes - role-based access control
 - Auth Requirements: Supabase authentication required for write operations

 ## Performance Impact:
 - Indexes: Added for frequently queried columns
 - Triggers: Auto-update timestamps on record changes
 - Estimated Impact: Optimized for real-time sync operations
*/

-- CRITICAL: Create sequence FIRST before any table references it
CREATE SEQUENCE IF NOT EXISTS order_seq START 1 INCREMENT 1;

-- ============================================
-- STEP 1: Create Base Tables (no dependencies)
-- ============================================

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('cashier', 'waiter', 'admin', 'kitchen')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu Items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_veg BOOLEAN DEFAULT false,
  preparation_time_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurant Tables
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER NOT NULL UNIQUE,
  capacity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
  current_order_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 2: Create Orders table (uses sequence)
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL DEFAULT 'ORD-' || to_char(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_seq')::TEXT, 5, '0'),
  table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  cashier_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  waiter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled')),
  total_amount DECIMAL(10, 2) DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'upi', 'pending')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 3: Create Dependent Tables
-- ============================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  special_instructions TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KOT Tickets table (Kitchen Order Tickets)
CREATE TABLE IF NOT EXISTS kot_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  table_number INTEGER,
  items JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live Events table (Real-time sync)
CREATE TABLE IF NOT EXISTS live_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 4: Create Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_cashier_id ON orders(cashier_id);
CREATE INDEX IF NOT EXISTS idx_orders_waiter_id ON orders(waiter_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_kot_tickets_order_id ON kot_tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_kot_tickets_status ON kot_tickets(status);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_live_events_created_at ON live_events(created_at DESC);

-- ============================================
-- STEP 5: Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE kot_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: Create RLS Policies
-- ============================================

-- Profiles: Users can read all, update only their own
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Menu Items: Everyone can read, only admin can modify
CREATE POLICY "menu_items_select" ON menu_items FOR SELECT USING (true);
CREATE POLICY "menu_items_insert" ON menu_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "menu_items_update" ON menu_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Restaurant Tables: Everyone can read, cashier/admin can modify
CREATE POLICY "tables_select" ON restaurant_tables FOR SELECT USING (true);
CREATE POLICY "tables_update" ON restaurant_tables FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('cashier', 'admin'))
);

-- Orders: Users can read/modify their own orders
CREATE POLICY "orders_select" ON orders FOR SELECT USING (
  auth.uid() = cashier_id OR auth.uid() = waiter_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('cashier', 'waiter', 'admin'))
);
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (
  auth.uid() = cashier_id OR auth.uid() = waiter_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Order Items: Linked to order access
CREATE POLICY "order_items_select" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (
      auth.uid() = orders.cashier_id OR auth.uid() = orders.waiter_id OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  )
);
CREATE POLICY "order_items_insert" ON order_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (
      auth.uid() = orders.cashier_id OR auth.uid() = orders.waiter_id OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  )
);

-- KOT Tickets: Kitchen staff can read all, others can read their own
CREATE POLICY "kot_tickets_select" ON kot_tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('kitchen', 'admin')) OR
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = kot_tickets.order_id AND (
      auth.uid() = orders.cashier_id OR auth.uid() = orders.waiter_id
    )
  )
);
CREATE POLICY "kot_tickets_insert" ON kot_tickets FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('cashier', 'waiter', 'admin'))
);
CREATE POLICY "kot_tickets_update" ON kot_tickets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('kitchen', 'admin'))
);

-- Live Events: Everyone can read, authenticated users can insert
CREATE POLICY "live_events_select" ON live_events FOR SELECT USING (true);
CREATE POLICY "live_events_insert" ON live_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- STEP 7: Create Triggers for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_tables_updated_at BEFORE UPDATE ON restaurant_tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kot_tickets_updated_at BEFORE UPDATE ON kot_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
