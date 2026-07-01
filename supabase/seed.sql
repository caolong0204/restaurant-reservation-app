-- ===========================================
-- Seed data for QA / local development
-- Run: npx supabase db push --db-url <QA_URL> then apply this seed
-- Or use: npx supabase seed --db-url <QA_URL>
-- ===========================================

-- Restaurant tables (mirrors production layout)
INSERT INTO public.restaurant_tables (code, floor, area, capacity, active, availability_status, sort_order)
VALUES
  ('Bàn 1',  'Tầng 1', 'Tầng 1', 4, true, 'active', 1),
  ('Bàn 2',  'Tầng 1', 'Tầng 1', 4, true, 'active', 2),
  ('Bàn 3',  'Tầng 1', 'Tầng 1', 4, true, 'active', 3),
  ('Bàn 4',  'Tầng 1', 'Tầng 1', 4, true, 'active', 4),
  ('Bàn 5',  'Tầng 1', 'Tầng 1', 4, true, 'active', 5),
  ('Bàn 6',  'Tầng 1', 'Tầng 1', 2, true, 'active', 6),
  ('Bàn 7',  'Tầng 1', 'Tầng 1', 2, true, 'active', 7),
  ('Bàn 8',  'Tầng 2', 'Tầng 2', 4, true, 'active', 8),
  ('Bàn 9',  'Tầng 2', 'Tầng 2', 2, true, 'active', 9),
  ('Bàn 10', 'Tầng 2', 'Tầng 2', 2, true, 'active', 10),
  ('Bàn 11', 'Tầng 2', 'Tầng 2', 2, true, 'active', 11),
  ('Bàn 12', 'Tầng 2', 'Tầng 2', 2, true, 'active', 12),
  ('Bàn 13', 'Tầng 2', 'Tầng 2', 2, true, 'active', 13),
  ('Bàn 14', 'Tầng 2', 'Tầng 2', 2, true, 'active', 14),
  ('Bàn 15', 'Tầng 2', 'Tầng 2', 2, true, 'active', 15),
  ('Bàn 16', 'Tầng 2', 'Tầng 2', 2, true, 'active', 16),
  ('Bàn 17', 'Tầng 2', 'Tầng 2', 2, true, 'active', 17)
ON CONFLICT (code) DO NOTHING;

-- Weekly operating hours
INSERT INTO public.restaurant_weekly_hours (weekday, is_open, open_time, close_time, last_booking_time)
VALUES
  (1, false, '10:30', '22:00', '21:00'), -- Monday: CLOSED
  (2, true,  '10:30', '22:00', '21:00'), -- Tuesday
  (3, true,  '10:30', '22:00', '21:00'), -- Wednesday
  (4, true,  '10:30', '22:00', '21:00'), -- Thursday
  (5, true,  '10:30', '22:00', '21:00'), -- Friday
  (6, true,  '10:30', '23:00', '21:00'), -- Saturday
  (7, true,  '10:30', '23:00', '21:30')  -- Sunday
ON CONFLICT (weekday) DO NOTHING;
