-- Update get_last_booking_time to reflect:
-- Weekdays (Mon-Thu): close 22:00 -> last booking 21:30
-- Weekends (Fri-Sun): close 22:30 -> last booking 22:00
create or replace function public.get_last_booking_time(p_date date)
returns time
language sql
immutable
as $$
  select case
    when extract(dow from p_date) in (0, 5, 6) then '22:00'::time
    else '21:30'::time
  end;
$$;

-- Update is_valid_reservation_slot to check proper closing times:
-- Weekdays (Mon-Thu): close 22:00
-- Weekends (Fri-Sun): close 22:30
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
    and p_time <= '22:00'::time
    and extract(minute from p_time)::integer in (0, 15, 30, 45)
    and p_time <= public.get_last_booking_time(p_date)
    and (
      (extract(hour from p_time)::integer * 60 + extract(minute from p_time)::integer)
      + public.get_booking_duration_minutes(p_party_size)
    ) <= (
      case
        when extract(dow from p_date) in (0, 5, 6) then 22 * 60 + 30
        else 22 * 60
      end
    );
$$;
