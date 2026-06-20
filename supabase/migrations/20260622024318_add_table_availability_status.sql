alter table public.restaurant_tables
  add column if not exists availability_status text not null default 'active'
  check (availability_status in ('active', 'held_for_walk_in', 'inactive'));

update public.restaurant_tables
set availability_status = case
  when active then 'active'
  else 'inactive'
end;

create or replace function public.sync_restaurant_table_availability()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.availability_status is null then
      new.availability_status := case when coalesce(new.active, true) then 'active' else 'inactive' end;
    end if;
  elsif new.availability_status is distinct from old.availability_status then
    new.active := new.availability_status = 'active';
  elsif new.active is distinct from old.active then
    new.availability_status := case when new.active then 'active' else 'inactive' end;
  end if;

  new.active := new.availability_status = 'active';
  return new;
end;
$$;

drop trigger if exists restaurant_tables_sync_availability on public.restaurant_tables;
create trigger restaurant_tables_sync_availability
before insert or update on public.restaurant_tables
for each row execute function public.sync_restaurant_table_availability();

drop index if exists restaurant_tables_active_sort_idx;
create index if not exists restaurant_tables_availability_sort_idx
  on public.restaurant_tables (availability_status, sort_order);

create index if not exists restaurant_tables_active_sort_idx
  on public.restaurant_tables (active, sort_order);

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

  if new.status not in ('confirmed', 'arrived', 'seated', 'completed') or new.table_id is null then
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
    and availability_status = 'active';

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
  where t.availability_status = 'active'
    and not exists (
      select 1
      from public.reservation_table_assignments a
      where a.table_id = t.id
        and (p_excluding_reservation_id is null or a.reservation_id <> p_excluding_reservation_id)
        and a.service_window && target.service_window
    )
  order by t.capacity asc, t.sort_order asc;
$$;
