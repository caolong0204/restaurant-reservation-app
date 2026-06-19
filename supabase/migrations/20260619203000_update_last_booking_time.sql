create or replace function public.get_last_booking_time(p_date date)
returns time
language sql
immutable
as $$
  select case
    -- isodow: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 7=Sun
    when extract(isodow from p_date) in (5, 6, 7) then '21:30'::time
    else '21:00'::time
  end;
$$;
