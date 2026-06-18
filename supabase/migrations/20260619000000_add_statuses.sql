-- Drop the existing constraints
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_status_check;
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_confirmed_requires_table;

-- Add new status check constraint
ALTER TABLE public.reservations ADD CONSTRAINT reservations_status_check 
  CHECK (status in ('pending', 'confirmed', 'arrived', 'seated', 'completed', 'cancelled', 'no_show'));

-- Add new active requirement constraint (replacing confirmed_requires_table)
ALTER TABLE public.reservations ADD CONSTRAINT reservations_active_requires_table 
  CHECK (status not in ('confirmed', 'arrived', 'seated', 'completed') or table_id is not null);

-- Update the sync_reservation_table_assignments function
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
  -- Always clean up previous assignments for this reservation
  DELETE FROM public.reservation_table_assignments
  WHERE reservation_id = coalesce(new.id, old.id);

  -- If deleting, we're done (the delete above handled it)
  IF tg_op = 'DELETE' THEN
    RETURN old;
  END IF;

  -- Only create assignments for "active" statuses
  IF new.status NOT IN ('confirmed', 'arrived', 'seated', 'completed') OR new.table_id IS NULL THEN
    RETURN new;
  END IF;

  -- Parse secondary table ids if any
  IF coalesce(trim(new.secondary_table_ids), '') <> '' THEN
    secondary_ids := string_to_array(new.secondary_table_ids, ',')::uuid[];
  END IF;

  -- Ensure the primary table isn't duplicated in the secondary list
  secondary_ids := array_remove(secondary_ids, new.table_id);
  selected_ids := array_prepend(new.table_id, secondary_ids);

  -- Check if total capacity is sufficient
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

  -- Insert primary assignment
  INSERT INTO public.reservation_table_assignments (
    reservation_id,
    table_id,
    role,
    reservation_date,
    service_window
  )
  VALUES (
    new.id,
    new.table_id,
    'primary',
    new.reservation_date,
    new.service_window
  );

  -- Insert secondary assignments
  INSERT INTO public.reservation_table_assignments (
    reservation_id,
    table_id,
    role,
    reservation_date,
    service_window
  )
  SELECT
    new.id,
    secondary_id,
    'secondary',
    new.reservation_date,
    new.service_window
  FROM unnest(secondary_ids) AS secondary_id;

  RETURN new;
EXCEPTION
  WHEN invalid_text_representation THEN
    RAISE EXCEPTION
      USING errcode = '22P02',
      message = 'One or more selected secondary table ids are invalid.';
END;
$$;
