create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create or replace function public.get_booking_duration_minutes(p_party_size integer)
returns integer
language sql
immutable
as $$
  select case
    when p_party_size <= 4 then 120
    when p_party_size <= 6 then 150
    else 180
  end;
$$;

create or replace function public.get_last_booking_time(p_date date)
returns time
language sql
immutable
as $$
  select case
    when extract(dow from p_date) in (0, 5, 6) then '22:30'::time
    else '22:00'::time
  end;
$$;

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
    and p_time <= '22:30'::time
    and extract(minute from p_time)::integer in (0, 15, 30, 45)
    and p_time <= public.get_last_booking_time(p_date)
    and (
      (extract(hour from p_time)::integer * 60 + extract(minute from p_time)::integer)
      + public.get_booking_duration_minutes(p_party_size)
    ) <= (22 * 60 + 30);
$$;

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
  guest_phone text not null,
  reservation_date date not null,
  reservation_time time not null,
  party_size integer not null check (party_size > 0 and party_size <= 24),
  occasion text,
  requested_area text,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  manual_arrangement boolean not null default false,
  table_id uuid references public.restaurant_tables(id) on delete set null,
  secondary_table_ids text,
  service_window tsrange generated always as (
    tsrange(
      (reservation_date + reservation_time)::timestamp,
      (reservation_date + reservation_time)::timestamp
        + make_interval(mins => public.get_booking_duration_minutes(party_size)),
      '[)'
    )
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservations_confirmed_requires_table
    check (status <> 'confirmed' or table_id is not null),
  constraint reservations_valid_slot
    check (public.is_valid_reservation_slot(reservation_date, reservation_time, party_size))
);

create table public.reservation_table_assignments (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  table_id uuid not null references public.restaurant_tables(id) on delete cascade,
  role text not null check (role in ('primary', 'secondary')),
  reservation_date date not null,
  service_window tsrange not null,
  created_at timestamptz not null default now(),
  constraint reservation_table_assignments_unique_reservation_table
    unique (reservation_id, table_id),
  constraint reservation_table_assignments_no_overlap
    exclude using gist (table_id with =, service_window with &&)
);

create unique index reservation_table_assignments_one_primary_idx
  on public.reservation_table_assignments (reservation_id)
  where role = 'primary';

create index restaurant_tables_active_sort_idx
  on public.restaurant_tables (active, sort_order);

create index reservations_table_id_idx
  on public.reservations (table_id)
  where table_id is not null;

create index reservations_date_time_idx
  on public.reservations (reservation_date, reservation_time);

create index reservations_status_date_time_idx
  on public.reservations (status, reservation_date, reservation_time);

create index reservations_confirmed_date_time_idx
  on public.reservations (reservation_date, reservation_time)
  where status = 'confirmed';

create index reservation_table_assignments_reservation_id_idx
  on public.reservation_table_assignments (reservation_id);

create index reservation_table_assignments_table_id_idx
  on public.reservation_table_assignments (table_id);

create index reservation_table_assignments_date_table_idx
  on public.reservation_table_assignments (reservation_date, table_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.sync_reservation_table_assignments()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  secondary_ids uuid[] := '{}'::uuid[];
  selected_ids uuid[] := '{}'::uuid[];
  selected_capacity integer := 0;
begin
  delete from public.reservation_table_assignments
  where reservation_id = coalesce(new.id, old.id);

  if tg_op = 'DELETE' then
    return old;
  end if;

  if new.status <> 'confirmed' or new.table_id is null then
    return new;
  end if;

  if coalesce(trim(new.secondary_table_ids), '') <> '' then
    secondary_ids := string_to_array(new.secondary_table_ids, ',')::uuid[];
  end if;

  secondary_ids := array_remove(secondary_ids, new.table_id);
  selected_ids := array_prepend(new.table_id, secondary_ids);

  select coalesce(sum(capacity), 0)
  into selected_capacity
  from public.restaurant_tables
  where id = any(selected_ids)
    and active = true;

  if selected_capacity < new.party_size and not new.manual_arrangement then
    raise exception
      using errcode = '23514',
      message = 'Selected tables do not provide enough seats for this reservation.';
  end if;

  insert into public.reservation_table_assignments (
    reservation_id,
    table_id,
    role,
    reservation_date,
    service_window
  )
  values (
    new.id,
    new.table_id,
    'primary',
    new.reservation_date,
    new.service_window
  );

  insert into public.reservation_table_assignments (
    reservation_id,
    table_id,
    role,
    reservation_date,
    service_window
  )
  select
    new.id,
    secondary_id,
    'secondary',
    new.reservation_date,
    new.service_window
  from unnest(secondary_ids) as secondary_id;

  return new;
exception
  when invalid_text_representation then
    raise exception
      using errcode = '22P02',
      message = 'One or more selected secondary table ids are invalid.';
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

create trigger reservations_sync_assignments_after_change
after insert or update or delete on public.reservations
for each row execute function public.sync_reservation_table_assignments();

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
      (p_date + p_time)::timestamp
        + make_interval(mins => public.get_booking_duration_minutes(p_party_size)),
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
    and not exists (
      select 1
      from public.reservation_table_assignments a
      where a.table_id = t.id
        and (p_excluding_reservation_id is null or a.reservation_id <> p_excluding_reservation_id)
        and a.service_window && target.service_window
    )
  order by t.capacity asc, t.sort_order asc;
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
  with slots(slot_time) as (
    select generated_slot::time
    from generate_series(
      p_date::timestamp + time '10:30',
      p_date::timestamp + time '22:30',
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

alter table public.staff_profiles enable row level security;
alter table public.staff_profiles force row level security;
alter table public.restaurant_tables enable row level security;
alter table public.restaurant_tables force row level security;
alter table public.reservations enable row level security;
alter table public.reservations force row level security;
alter table public.reservation_table_assignments enable row level security;
alter table public.reservation_table_assignments force row level security;

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
with check (
  status = 'pending'
  and manual_arrangement = false
  and table_id is null
  and secondary_table_ids is null
);

create policy reservations_staff_all on public.reservations
for all to authenticated
using ((select public.is_active_staff()))
with check ((select public.is_active_staff()));

create policy reservation_table_assignments_staff_all on public.reservation_table_assignments
for all to authenticated
using ((select public.is_active_staff()))
with check ((select public.is_active_staff()));

grant execute on function public.is_active_staff() to anon, authenticated;
grant execute on function public.get_available_tables(date, time, integer, uuid) to anon, authenticated;
grant execute on function public.get_slot_availability(date, integer) to anon, authenticated;
