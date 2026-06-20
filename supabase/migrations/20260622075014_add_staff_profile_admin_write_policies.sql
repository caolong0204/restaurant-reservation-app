create policy staff_profiles_admin_insert
on public.staff_profiles
for insert
to authenticated
with check (public.is_active_admin());

create policy staff_profiles_admin_update
on public.staff_profiles
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());
