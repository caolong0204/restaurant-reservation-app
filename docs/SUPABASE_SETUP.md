# Supabase Setup & Deployment Guide

## Current State

The application is actively connected to Supabase for its backend operations, including Auth, Postgres Database, and Realtime WebSocket subscriptions.

## 1. Database & Realtime Architecture

### Realtime Subscriptions
The admin dashboard uses Supabase Realtime to listen for new bookings (`INSERT` events on the `reservations` table). This allows staff to receive instant notifications without manually refreshing the page.

### RLS (Row Level Security) Constraints with Realtime
Supabase Realtime has strict performance constraints when evaluating RLS policies.
- **The Problem**: The standard `reservations_staff_all` policy uses a `security definer` function (`is_active_staff()`) that queries the `staff_profiles` table. Realtime struggles to evaluate complex join/function policies efficiently and will silently drop WebSocket messages.
- **The Solution**: We created a dedicated bypass policy specifically for reading data:
  ```sql
  create policy reservations_realtime_select on public.reservations
  for select to authenticated
  using (true);
  ```
  Since only staff members have `authenticated` accounts, it is safe to allow them to `SELECT` from the reservations table directly without querying `staff_profiles` again just for Realtime broadcasts.

### SSR & Realtime Connection Race Conditions
In `components/reservation-provider.tsx`, we must explicitly `await supabase.auth.getSession()` before calling `supabase.channel().subscribe()`. 
If we do not wait for the session to hydrate from cookies in Next.js SSR, the WebSocket connection initializes as the `anon` role, causing Realtime to drop messages because `anon` doesn't have `SELECT` privileges.

## 2. Frontend Optimizations (Booking Flow)

To minimize Database queries and prevent UI blocking during public booking:
- **Eager Loading**: Slot availability is fetched proactively when the user finishes Step 2.
- **In-Memory Caching**: A 3-minute TTL cache (`useRef`) prevents redundant API calls when users navigate back and forth between Date Selection and Time Selection.
- **Debounce**: A 300ms debounce ensures rapid clicks on the calendar only trigger 1 API call.

## 3. Deployment Steps (Vercel & Supabase)

### Step 1: Set up Supabase
1. Create a Supabase project.
2. Link the CLI and run migrations:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
3. Ensure Realtime is enabled for the `reservations` table:
   ```sql
   alter publication supabase_realtime add table reservations;
   ```
4. Apply the Realtime RLS bypass policy (as mentioned in section 1).

### Step 2: Set up Staff Accounts
1. Go to Supabase Authentication -> Users and create a new user.
2. Insert that user into `staff_profiles`:
   ```sql
   insert into public.staff_profiles (user_id, display_name, role, active)
   values ('AUTH_USER_ID_HERE', 'Admin', 'admin', true);
   ```

### Step 3: Deploy to Vercel
1. Link your repository to Vercel.
2. Add the following Environment Variables in the Vercel Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key (Wait, the app uses NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
3. Trigger a deployment (`git push main`).

## Expected Runtime Behavior

- `/admin` redirects to `/admin/login` when unauthenticated.
- Staff access is strictly validated via Server Actions against `staff_profiles`.
- Public booking writes to Supabase as `pending`.
- Realtime instantly notifies active `/admin` tabs of new bookings.
