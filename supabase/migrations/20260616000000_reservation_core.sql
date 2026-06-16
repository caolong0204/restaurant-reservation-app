create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create table public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  floor text not null check (floor in ('Tầng 1', 'Tầng 2')),
  area text not null,
  capacity integer not null check (capacity > 0 and capacity <= 24),
  active boolean not null default true,
  sort_order integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  guest_email text not null,
  guest_phone text not null,
  reservation_date date not null,
  reservation_time time not null,
  party_size integer not null check (party_size > 0 and party_size <= 24),
  occasion text,
  requested_area text,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  table_id uuid references public.restaurant_tables(id) on delete set null,
  service_window tsrange generated always as (
    tsrange(
      (reservation_date + reservation_time)::timestamp,
      ((reservation_date + reservation_time)::timestamp + (
        case
          when party_size <= 3 then interval '120 minutes'
          when party_size <= 5 then interval '150 minutes'
          else interval '180 minutes'
        end
      )),
      '[)'
    )
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservations_confirmed_requires_table
    check (status <> 'confirmed' or table_id is not null),
  constraint reservations_confirmed_table_overlap
    exclude using gist (table_id with =, service_window with &&)
    where (status = 'confirmed' and table_id is not null)
);

create index restaurant_tables_active_sort_idx
  on public.restaurant_tables (active, sort_order);

create index reservations_table_id_idx
  on public.reservations (table_id);

create index reservations_date_time_idx
  on public.reservations (reservation_date, reservation_time);

create index reservations_status_date_time_idx
  on public.reservations (status, reservation_date, reservation_time);

create index reservations_confirmed_window_idx
  on public.reservations using gist (table_id, service_window)
  where (status = 'confirmed' and table_id is not null);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger staff_profiles_set_updated_at
before update on public.staff_profiles
for each row execute function public.set_updated_at();

create trigger restaurant_tables_set_updated_at
before update on public.restaurant_tables
for each row execute function public.set_updated_at();

create trigger reservations_set_updated_at
before update on public.reservations
for each row execute function public.set_updated_at();

insert into public.restaurant_tables (id, code, floor, area, capacity, active, sort_order)
values
  ('10000000-0000-0000-0000-000000000001', 'Bàn 1',  'Tầng 1', 'Tầng 1', 4, true, 1),
  ('10000000-0000-0000-0000-000000000002', 'Bàn 2',  'Tầng 1', 'Tầng 1', 4, true, 2),
  ('10000000-0000-0000-0000-000000000003', 'Bàn 3',  'Tầng 1', 'Tầng 1', 4, true, 3),
  ('10000000-0000-0000-0000-000000000004', 'Bàn 4',  'Tầng 1', 'Tầng 1', 4, true, 4),
  ('10000000-0000-0000-0000-000000000005', 'Bàn 5',  'Tầng 1', 'Tầng 1', 4, true, 5),
  ('10000000-0000-0000-0000-000000000006', 'Bàn 6',  'Tầng 1', 'Tầng 1', 2, true, 6),
  ('10000000-0000-0000-0000-000000000007', 'Bàn 7',  'Tầng 1', 'Tầng 1', 2, true, 7),
  ('10000000-0000-0000-0000-000000000008', 'Bàn 8',  'Tầng 1', 'Tầng 1', 4, true, 8),
  ('10000000-0000-0000-0000-000000000009', 'Bàn 9',  'Tầng 2', 'Tầng 2', 2, true, 9),
  ('10000000-0000-0000-0000-000000000010', 'Bàn 10', 'Tầng 2', 'Tầng 2', 2, true, 10),
  ('10000000-0000-0000-0000-000000000011', 'Bàn 11', 'Tầng 2', 'Tầng 2', 2, true, 11),
  ('10000000-0000-0000-0000-000000000012', 'Bàn 12', 'Tầng 2', 'Tầng 2', 2, true, 12),
  ('10000000-0000-0000-0000-000000000013', 'Bàn 13', 'Tầng 2', 'Tầng 2', 2, true, 13),
  ('10000000-0000-0000-0000-000000000014', 'Bàn 14', 'Tầng 2', 'Tầng 2', 2, true, 14),
  ('10000000-0000-0000-0000-000000000015', 'Bàn 15', 'Tầng 2', 'Tầng 2', 2, true, 15),
  ('10000000-0000-0000-0000-000000000016', 'Bàn 16', 'Tầng 2', 'Tầng 2', 2, true, 16),
  ('10000000-0000-0000-0000-000000000017', 'Bàn 17', 'Tầng 2', 'Tầng 2', 2, true, 17)
on conflict (code) do nothing;

create or replace function public.is_active_staff()
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
  );
$$;

create or replace function public.get_available_tables(
  p_date date,
  p_time time,
  p_party_size integer,
  p_excluding_reservation_id uuid default null
)
returns table (
  id uuid,
  code text,
  floor text,
  area text,
  capacity integer,
  active boolean,
  sort_order integer,
  notes text
)
language sql
security definer
set search_path = public
as $$
  with target_window as (
    select tsrange(
      (p_date + p_time)::timestamp,
      ((p_date + p_time)::timestamp + (
        case
          when p_party_size <= 3 then interval '120 minutes'
          when p_party_size <= 5 then interval '150 minutes'
          else interval '180 minutes'
        end
      )),
      '[)'
    ) as service_window
  )
  select
    t.id,
    t.code,
    t.floor,
    t.area,
    t.capacity,
    t.active,
    t.sort_order,
    t.notes
  from public.restaurant_tables t
  cross join target_window target
  where t.active = true
    and t.capacity >= p_party_size
    and not exists (
      select 1
      from public.reservations r
      where r.table_id = t.id
        and r.status = 'confirmed'
        and (p_excluding_reservation_id is null or r.id <> p_excluding_reservation_id)
        and r.service_window && target.service_window
    )
  order by t.capacity asc, t.sort_order asc;
$$;

create or replace function public.get_slot_availability(
  p_date date,
  p_party_size integer
)
returns table (
  time text,
  available_count integer
)
language sql
security definer
set search_path = public
as $$
  with slots(slot_time) as (
    select unnest(array[
      '10:00'::time, '10:30'::time,
      '11:00'::time, '11:30'::time,
      '12:00'::time, '12:30'::time,
      '13:00'::time, '13:30'::time,
      '14:00'::time, '14:30'::time,
      '15:00'::time, '15:30'::time,
      '16:00'::time, '16:30'::time,
      '17:00'::time, '17:30'::time,
      '18:00'::time, '18:30'::time,
      '19:00'::time, '19:30'::time,
      '20:00'::time, '20:30'::time,
      '21:00'::time, '21:30'::time,
      '22:00'::time, '22:30'::time
    ])
  )
  select
    to_char(s.slot_time, 'HH24:MI') as time,
    count(t.id)::integer as available_count
  from slots s
  left join lateral public.get_available_tables(p_date, s.slot_time, 1, null) t on true
  group by s.slot_time
  order by s.slot_time;
$$;

alter table public.staff_profiles enable row level security;
alter table public.restaurant_tables enable row level security;
alter table public.reservations enable row level security;

create policy staff_profiles_self_select on public.staff_profiles
for select to authenticated
using (user_id = (select auth.uid()));

create policy staff_profiles_staff_select on public.staff_profiles
for select to authenticated
using ((select public.is_active_staff()));

create policy restaurant_tables_staff_all on public.restaurant_tables
for all to authenticated
using ((select public.is_active_staff()))
with check ((select public.is_active_staff()));

create policy reservations_guest_insert on public.reservations
for insert to anon, authenticated
with check (status = 'pending' and table_id is null);

create policy reservations_staff_all on public.reservations
for all to authenticated
using ((select public.is_active_staff()))
with check ((select public.is_active_staff()));

grant execute on function public.is_active_staff() to anon, authenticated;
grant execute on function public.get_available_tables(date, time, integer, uuid) to anon, authenticated;
grant execute on function public.get_slot_availability(date, integer) to anon, authenticated;
