create or replace function public.is_valid_reservation_slot(
  p_date date,
  p_time time,
  p_party_size integer
)
returns boolean
language sql
immutable
as $$
  select
    p_party_size between 1 and 24
    and p_time >= '10:30'::time
    and extract(minute from p_time)::integer in (0, 15, 30, 45)
    and p_time <= public.get_last_booking_time(p_date);
$$;
