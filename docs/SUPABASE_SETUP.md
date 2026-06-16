# Supabase Setup

This app can run in demo mode without Supabase environment variables. To use the production data/auth path:

1. Create a Supabase project.
2. Run `supabase/migrations/20260616000000_reservation_core.sql` in the SQL editor or through the Supabase CLI.
3. Add these values to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

4. Create at least one Supabase Auth user.
5. Insert that user as active staff:

```sql
insert into public.staff_profiles (user_id, display_name, role, active)
values ('AUTH_USER_ID_HERE', 'Admin', 'admin', true)
on conflict (user_id) do update
set active = true, role = 'admin';
```

Admin access is blocked unless the signed-in user exists in `staff_profiles` with `active = true`.
