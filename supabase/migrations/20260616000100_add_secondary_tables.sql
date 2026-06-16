alter table public.reservations add column if not exists secondary_table_ids text;

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
    and not exists (
      select 1
      from public.reservations r
      where (r.table_id = t.id or t.id::text = any(string_to_array(coalesce(r.secondary_table_ids, ''), ',')))
        and r.status = 'confirmed'
        and (p_excluding_reservation_id is null or r.id <> p_excluding_reservation_id)
        and r.service_window && target.service_window
    )
  order by t.capacity asc, t.sort_order asc;
$$;
