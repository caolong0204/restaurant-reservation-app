-- Fix logic giữ assignment cho đúng các trạng thái:
-- confirmed, arrived, seated  → giữ (bàn đang được sử dụng)
-- completed, cancelled, no_show, pending → xóa (bàn trống)

-- 1. Sửa constraint: chỉ yêu cầu table khi còn đang phục vụ (không bao gồm completed)
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_active_requires_table;
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_confirmed_requires_table;

ALTER TABLE public.reservations ADD CONSTRAINT reservations_active_requires_table
  CHECK (status NOT IN ('confirmed', 'arrived', 'seated') OR table_id IS NOT NULL);

-- 2. Cập nhật trigger: chỉ giữ assignment khi bàn đang phục vụ thực tế
CREATE OR REPLACE FUNCTION public.sync_reservation_table_assignments()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  secondary_ids uuid[] := '{}'::uuid[];
  selected_ids uuid[] := '{}'::uuid[];
  selected_capacity integer := 0;
BEGIN
  -- Dọn dẹp assignment cũ
  DELETE FROM public.reservation_table_assignments
  WHERE reservation_id = coalesce(new.id, old.id);

  IF tg_op = 'DELETE' THEN
    RETURN old;
  END IF;

  -- Chỉ tạo assignment khi bàn đang thực sự phục vụ khách.
  -- confirmed: đã xác nhận, khách chưa đến
  -- arrived:   khách đã đến, chờ dẫn vào bàn
  -- seated:    khách đang ngồi ăn
  -- Các trạng thái còn lại (completed, cancelled, no_show, pending)
  -- đều giải phóng bàn.
  IF new.status NOT IN ('confirmed', 'arrived', 'seated') OR new.table_id IS NULL THEN
    RETURN new;
  END IF;

  IF coalesce(trim(new.secondary_table_ids), '') <> '' THEN
    secondary_ids := string_to_array(new.secondary_table_ids, ',')::uuid[];
  END IF;

  secondary_ids := array_remove(secondary_ids, new.table_id);
  selected_ids := array_prepend(new.table_id, secondary_ids);

  SELECT coalesce(sum(capacity), 0)
  INTO selected_capacity
  FROM public.restaurant_tables
  WHERE id = any(selected_ids)
    AND active = true;

  IF selected_capacity < new.party_size AND NOT new.manual_arrangement THEN
    RAISE EXCEPTION
      USING errcode = '23514',
      message = 'Selected tables do not provide enough seats for this reservation.';
  END IF;

  INSERT INTO public.reservation_table_assignments (
    reservation_id, table_id, role, reservation_date, service_window
  )
  VALUES (new.id, new.table_id, 'primary', new.reservation_date, new.service_window);

  INSERT INTO public.reservation_table_assignments (
    reservation_id, table_id, role, reservation_date, service_window
  )
  SELECT new.id, secondary_id, 'secondary', new.reservation_date, new.service_window
  FROM unnest(secondary_ids) AS secondary_id;

  RETURN new;
EXCEPTION
  WHEN invalid_text_representation THEN
    RAISE EXCEPTION
      USING errcode = '22P02',
      message = 'One or more selected secondary table ids are invalid.';
END;
$$;
