-- =================================================================
-- MR. MANGO / TASTYBITE RESTAURANT POS - SUPABASE REALTIME SCHEMA
-- Copy and paste this script into Supabase SQL Editor and click RUN
-- =================================================================

-- 1. Create Live Events Table for Realtime Sync
CREATE TABLE IF NOT EXISTS public.live_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kot_no TEXT UNIQUE NOT NULL,
  table_no TEXT NOT NULL,
  area TEXT DEFAULT 'Main Hall',
  guests INTEGER DEFAULT 2,
  waiter_name TEXT NOT NULL,
  order_type TEXT DEFAULT 'Dine-In',
  status TEXT DEFAULT 'KOT Punched',
  items JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  gst NUMERIC(10,2) NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Tables Status Table
CREATE TABLE IF NOT EXISTS public.dining_tables (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  guests INTEGER DEFAULT 4,
  status TEXT DEFAULT 'Available',
  current_kot TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Supabase Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dining_tables;

-- 5. Row Level Security (RLS) Policies (Enable Public Read/Write for POS Terminals)
ALTER TABLE public.live_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dining_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all POS users" ON public.live_events FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all POS users" ON public.live_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for orders" ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Enable all for dining_tables" ON public.dining_tables FOR ALL USING (true);
