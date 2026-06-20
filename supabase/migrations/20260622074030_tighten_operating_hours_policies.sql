drop policy if exists restaurant_weekly_hours_admin_update on public.restaurant_weekly_hours;
drop policy if exists restaurant_display_settings_admin_update on public.restaurant_display_settings;

create policy restaurant_weekly_hours_admin_insert
on public.restaurant_weekly_hours
for insert
to authenticated
with check (public.is_active_admin());

create policy restaurant_weekly_hours_admin_update
on public.restaurant_weekly_hours
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

create policy restaurant_weekly_hours_admin_delete
on public.restaurant_weekly_hours
for delete
to authenticated
using (public.is_active_admin());

create policy restaurant_display_settings_admin_insert
on public.restaurant_display_settings
for insert
to authenticated
with check (public.is_active_admin());

create policy restaurant_display_settings_admin_update
on public.restaurant_display_settings
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

create policy restaurant_display_settings_admin_delete
on public.restaurant_display_settings
for delete
to authenticated
using (public.is_active_admin());

revoke execute on function public.is_active_admin() from public;
grant execute on function public.is_active_admin() to authenticated;
