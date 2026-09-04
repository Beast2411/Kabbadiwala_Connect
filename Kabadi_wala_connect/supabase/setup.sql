-- Run this in Supabase SQL Editor after your tables exist.
-- Enables RLS, policies, indexes, and seed data for Kabadiwala Connect.

-- Enum (skip if already created)
DO $$ BEGIN
  CREATE TYPE lot_status AS ENUM ('created', 'matched', 'handed_over', 'paid');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enable RLS on all tables
ALTER TABLE public.collectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recyclers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traceability ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "collectors_all" ON public.collectors;
DROP POLICY IF EXISTS "recyclers_read" ON public.recyclers;
DROP POLICY IF EXISTS "recyclers_insert" ON public.recyclers;
DROP POLICY IF EXISTS "recyclers_update" ON public.recyclers;
DROP POLICY IF EXISTS "materials_read" ON public.materials;
DROP POLICY IF EXISTS "lots_all" ON public.lots;
DROP POLICY IF EXISTS "prices_read" ON public.prices;
DROP POLICY IF EXISTS "transactions_read" ON public.transactions;
DROP POLICY IF EXISTS "transactions_insert" ON public.transactions;
DROP POLICY IF EXISTS "traceability_all" ON public.traceability;

-- Hackathon/demo policies (tighten for production with auth.uid())
CREATE POLICY "collectors_all" ON public.collectors FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "recyclers_read" ON public.recyclers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "recyclers_insert" ON public.recyclers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "recyclers_update" ON public.recyclers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "materials_read" ON public.materials FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "lots_all" ON public.lots FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "prices_read" ON public.prices FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "transactions_read" ON public.transactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "transactions_insert" ON public.transactions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "traceability_all" ON public.traceability FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lots_collector_id ON public.lots(collector_id);
CREATE INDEX IF NOT EXISTS idx_lots_status ON public.lots(status);
CREATE INDEX IF NOT EXISTS idx_prices_category ON public.prices(material_category);
CREATE INDEX IF NOT EXISTS idx_recyclers_authorized ON public.recyclers(authorized);
CREATE INDEX IF NOT EXISTS idx_collectors_phone ON public.collectors(phone);

-- Realtime for lots (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.lots;

-- Seed materials (skip if you already have rows)
INSERT INTO public.materials (category, sub_category, description, condition) VALUES
  ('PCB', 'circuit_board', 'Green circuit boards from computers, TVs, and phones', 'mixed'),
  ('cables', 'copper_wire', 'Stripped or unstripped copper and mixed cables', 'mixed'),
  ('batteries', 'lead_acid', 'Vehicle and inverter lead-acid batteries', 'used'),
  ('CRT', 'display', 'CRT and old TV tubes', 'used'),
  ('motors', 'electric', 'Electric motors with copper windings', 'used'),
  ('mixed_plastic', 'HDPE', 'Rigid plastic drums, crates, and chairs', 'mixed'),
  ('LCD', 'panel', 'Flat panel LCD/LED display scrap', 'used')
ON CONFLICT DO NOTHING;

-- Seed recyclers around Mumbai (only if table is empty)
INSERT INTO public.recyclers (name, location_lat, location_lng, materials_accepted, authorized, registration_id, contact, offered_rates, pickup_available)
SELECT * FROM (VALUES
  ('Dharavi Eco Metals & E-Recyclers', 19.0435, 72.8526, ARRAY['metal','e_waste','hazardous']::text[], true, 'MPCB/EW-2019/1042', '+91 98201 12345', '{"PCB":180,"cables":55,"batteries":110,"motors":140}'::jsonb, true),
  ('National Scrap & Plastic Mart', 19.0601, 72.8685, ARRAY['plastic','paper','metal']::text[], true, 'MPCB/EW-2020/0881', '+91 98190 54321', '{"mixed_plastic":22,"cables":48,"metal":650}'::jsonb, true),
  ('Green Earth Battery & E-Waste', 19.0725, 72.8850, ARRAY['hazardous','e_waste']::text[], true, 'MPCB/EW-2018/0312', '+91 97690 88776', '{"batteries":105,"PCB":175,"CRT":15}'::jsonb, false),
  ('Apex Paper & Cardboard Agent', 19.0880, 72.8450, ARRAY['paper','plastic']::text[], false, 'MPCB/EW-2021/0445', '+91 99200 11223', '{"mixed_plastic":18,"paper":14}'::jsonb, true),
  ('Sion Industrial E-Waste Hub', 19.0440, 72.8660, ARRAY['e_waste','hazardous','metal']::text[], true, 'MPCB/EW-2017/0199', '+91 98765 43210', '{"PCB":195,"LCD":125,"motors":130}'::jsonb, true),
  ('Bandra Metal Recovery Works', 19.0540, 72.8400, ARRAY['metal','cables']::text[], true, 'MPCB/EW-2022/0110', '+91 98989 89898', '{"cables":58,"metal":680,"motors":145}'::jsonb, false),
  ('Kurla West Plastic Traders', 19.0650, 72.8800, ARRAY['plastic','paper']::text[], true, 'MPCB/EW-2020/0777', '+91 97654 32109', '{"mixed_plastic":24,"paper":16}'::jsonb, true),
  ('Chembur Authorized Recycler', 19.0520, 72.8990, ARRAY['e_waste','hazardous','metal']::text[], true, 'MPCB/EW-2019/0555', '+91 98123 45678', '{"batteries":115,"PCB":170,"CRT":18}'::jsonb, true)
) AS v(name, location_lat, location_lng, materials_accepted, authorized, registration_id, contact, offered_rates, pickup_available)
WHERE NOT EXISTS (SELECT 1 FROM public.recyclers LIMIT 1);

-- Seed 30 days of price history for Mumbai
INSERT INTO public.prices (material_category, location, price_date, buying_price, quoted_price, unit)
SELECT
  cat.category,
  'Mumbai',
  (CURRENT_DATE - (n || ' days')::interval)::date,
  cat.base + (random() * 20 - 10)::numeric(10,2),
  cat.base + (random() * 25 - 5)::numeric(10,2),
  'kg'
FROM generate_series(0, 29) AS n
CROSS JOIN (VALUES
  ('PCB', 180::numeric),
  ('cables', 52::numeric),
  ('batteries', 100::numeric),
  ('CRT', 14::numeric),
  ('motors', 135::numeric),
  ('mixed_plastic', 20::numeric),
  ('LCD', 120::numeric)
) AS cat(category, base)
WHERE NOT EXISTS (SELECT 1 FROM public.prices WHERE location = 'Mumbai' LIMIT 1);
