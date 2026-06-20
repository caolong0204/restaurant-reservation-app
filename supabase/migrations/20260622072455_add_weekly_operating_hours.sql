create table if not exists public.restaurant_weekly_hours (
  weekday integer primary key check (weekday between 1 and 7),
  is_open boolean not null default true,
  open_time time not null default '10:30',
  close_time time not null default '22:00',
  last_booking_time time not null default '21:00',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint restaurant_weekly_hours_time_order check (
    is_open = false
    or (
      open_time < close_time
      and last_booking_time >= open_time
      and last_booking_time <= close_time
      and extract(minute from open_time)::integer in (0, 15, 30, 45)
      and extract(minute from close_time)::integer in (0, 15, 30, 45)
      and extract(minute from last_booking_time)::integer in (0, 15, 30, 45)
    )
  )
);

create table if not exists public.restaurant_display_settings (
  id integer primary key default 1 check (id = 1),
  show_closed_days_in_footer boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.restaurant_weekly_hours (weekday, is_open, open_time, close_time, last_booking_time)
values
  (1, false, '10:30', '22:00', '21:00'),
  (2, true, '10:30', '22:00', '21:00'),
  (3, true, '10:30', '22:00', '21:00'),
  (4, true, '10:30', '22:00', '21:00'),
  (5, true, '10:30', '22:00', '21:30'),
  (6, true, '10:30', '23:00', '21:30'),
  (7, true, '10:30', '23:00', '21:30')
on conflict (weekday) do nothing;

insert into public.restaurant_display_settings (id, show_closed_days_in_footer)
values (1, false)
on conflict (id) do nothing;

drop trigger if exists restaurant_weekly_hours_set_updated_at on public.restaurant_weekly_hours;
create trigger restaurant_weekly_hours_set_updated_at
before update on public.restaurant_weekly_hours
for each row execute function public.set_updated_at();

drop trigger if exists restaurant_display_settings_set_updated_at on public.restaurant_display_settings;
create trigger restaurant_display_settings_set_updated_at
before update on public.restaurant_display_settings
for each row execute function public.set_updated_at();

create or replace function public.is_active_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_profiles
    where user_id = (select auth.uid())
      and active = true
      and role = 'admin'
  );
$$;

create or replace function public.is_valid_reservation_slot(
  p_date date,
  p_time time,
  p_party_size integer
)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.restaurant_weekly_hours h
    where h.weekday = extract(isodow from p_date)::integer
      and h.is_open = true
      and p_party_size between 1 and 24
      and p_time >= h.open_time
      and p_time <= h.last_booking_time
      and extract(minute from p_time)::integer in (0, 15, 30, 45)
  );
$$;

create or replace function public.get_slot_availability(
  p_date date,
  p_party_size integer
)
returns table (
  "time" text,
  available_count integer
)
language sql
security definer
set search_path = public
as $$
  with schedule as (
    select open_time, last_booking_time
    from public.restaurant_weekly_hours
    where weekday = extract(isodow from p_date)::integer
      and is_open = true
  ),
  slots(slot_time) as (
    select generated_slot::time
    from schedule
    cross join lateral generate_series(
      p_date::timestamp + schedule.open_time,
      p_date::timestamp + schedule.last_booking_time,
      interval '15 minutes'
    ) as generated_slot
    where public.is_valid_reservation_slot(p_date, generated_slot::time, p_party_size)
  ),
  availability as (
    select
      s.slot_time,
      count(t.id)::integer as available_table_count,
      coalesce(sum(t.capacity), 0)::integer as available_capacity
    from slots s
    left join lateral public.get_available_tables(p_date, s.slot_time, p_party_size, null) t on true
    group by s.slot_time
  )
  select
    to_char(slot_time, 'HH24:MI') as time,
    case
      when available_capacity >= p_party_size then available_table_count
      else 0
    end as available_count
  from availability
  order by slot_time;
$$;

alter table public.restaurant_weekly_hours enable row level security;
alter table public.restaurant_weekly_hours force row level security;
alter table public.restaurant_display_settings enable row level security;
alter table public.restaurant_display_settings force row level security;

drop policy if exists restaurant_weekly_hours_public_select on public.restaurant_weekly_hours;
create policy restaurant_weekly_hours_public_select on public.restaurant_weekly_hours
for select to anon, authenticated
using (true);

drop policy if exists restaurant_weekly_hours_admin_update on public.restaurant_weekly_hours;
create policy restaurant_weekly_hours_admin_update on public.restaurant_weekly_hours
for all to authenticated
using ((select public.is_active_admin()))
with check ((select public.is_active_admin()));

drop policy if exists restaurant_display_settings_public_select on public.restaurant_display_settings;
create policy restaurant_display_settings_public_select on public.restaurant_display_settings
for select to anon, authenticated
using (true);

drop policy if exists restaurant_display_settings_admin_update on public.restaurant_display_settings;
create policy restaurant_display_settings_admin_update on public.restaurant_display_settings
for all to authenticated
using ((select public.is_active_admin()))
with check ((select public.is_active_admin()));

grant execute on function public.is_active_admin() to anon, authenticated;
grant execute on function public.get_slot_availability(date, integer) to anon, authenticated;
