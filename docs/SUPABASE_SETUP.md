# Supabase Setup

## Current State

Supabase dependencies, helper clients, auth actions, and SQL migrations exist in the repo.

However, the database has **not** been deployed in the current project context. Existing SQL files under `supabase/migrations/` should be treated as drafts. Do not run them blindly without syncing them to the current frontend/demo rules.

## Required Sync Before Deploy

Update migrations/RPCs so they match the current app behavior:

- Duration:
  - 1-4 guests: 120 minutes.
  - 5-6 guests: 150 minutes.
  - 7+ guests: 180 minutes.
- Public bookings:
  - Insert as `pending`.
  - Must not include `table_id`.
  - Must not hold availability.
- Confirmed bookings:
  - Must have an assigned main table.
  - Must block main table and any secondary/joined tables.
- Slot availability:
  - Must respect requested party size.
  - Must ignore pending/cancelled bookings.
- Large parties:
  - Decide how to persist joined tables and manual capacity override.
  - Add DB-level protection against double-booking joined/secondary tables.
- RLS:
  - Public insert only for safe pending reservations.
  - Active staff can read/mutate admin data.

## Environment Variables

Add these values to `.env.local` only when ready to use Supabase mode:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Without these values, the app runs in demo mode.

## Staff Setup

After deploying the final schema:

1. Create at least one Supabase Auth user.
2. Insert that user into `staff_profiles`:

```sql
insert into public.staff_profiles (user_id, display_name, role, active)
values ('AUTH_USER_ID_HERE', 'Admin', 'admin', true)
on conflict (user_id) do update
set active = true, role = 'admin';
```

Admin access is blocked unless the signed-in user exists in `staff_profiles` with `active = true`.

## Expected Runtime Behavior

- If Supabase env vars are missing:
  - `/admin` uses demo mode.
  - No login is required.
- If Supabase env vars are present:
  - `/admin` requires login.
  - Server Actions verify active staff status.
  - Public booking writes to Supabase as pending.

## Verification After Deploy

Run:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Manual QA:

- Guest booking creates a pending reservation.
- Pending reservation appears in admin but does not occupy a table.
- Admin can assign enough-capacity tables and confirm.
- Admin cannot double-book overlapping confirmed reservations.
- Joined/secondary tables also block availability.
- Short-capacity assignment requires either joined tables or manual override.
- `/admin` redirects to `/admin/login` when unauthenticated.
