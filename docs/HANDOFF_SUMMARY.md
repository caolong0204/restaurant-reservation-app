# Handoff Summary

## Project Context

- Repository: `restaurant-reservation-app`
- Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Base UI/shadcn-style components, `sonner`, `lucide-react`
- Product: public booking flow plus `/admin` reservation operations dashboard
- Current mode: direct Supabase mode for public booking, admin auth, and reservation operations
- Next major step: QA hardening, migration refinement, and production polish

## Current Product Decisions

- Guests do not choose tables.
- Public bookings are created as `pending`.
- Pending bookings do not hold or occupy tables.
- Admin assigns tables when confirming.
- Confirmed bookings occupy assigned main tables and secondary/joined tables.
- Admin row/table view is the primary workflow.
- Day calendar/table timeline is a secondary availability view.
- Calendar grid uses 30-minute cells, with full-hour labels only.
- Empty calendar cells should not show "Trống" text and should not have green background.
- Booking bars show party size with a people icon plus duration.

## Current Business Rules

- Restaurant: Flambé
- Address: 23 Gia Ngư, Hà Nội
- Hotline: 0927355656
- Public/admin selectable slots are 15-minute slots.
- Weekday cutoff: `22:00`.
- Friday/Saturday/Sunday cutoff: `22:30`.
- Duration:
  - 1-4 guests: 120 minutes.
  - 5-6 guests: 150 minutes.
  - 7+ guests: 180 minutes.
- Large-party assignment:
  - If selected table capacity is enough, confirm normally.
  - If capacity is short, admin must select joined tables or tick manual arrangement.
  - Manual arrangement checkbox is hidden unless capacity is short.

## Implemented Frontend/Admin State

- Public booking wizard:
  - Party size, date, time, guest info, success.
  - Slot availability loading/error state.
- Admin dashboard:
  - Dense row-based reservation table.
  - Search, status filter, date filter.
  - Manual create.
  - Edit.
  - Cancel.
  - Confirm with table assignment.
  - Day timeline by table.
  - Capacity guard for large groups in both confirm and edit flows.

## Backend Status

- Supabase dependencies and helper files are wired into the app.
- Supabase migrations exist under `supabase/migrations`.
- Public booking, admin booking actions, admin login, and route protection now work directly against Supabase.

Keep syncing:

- Duration rules in SQL/RPC.
- Slot availability by party size.
- Main + secondary table overlap protection.
- DB-level constraints/indexes for double-book prevention.
- RLS policies and staff authorization.
- Public insert policy for pending/no-table reservations only.

## Key Files

- `components/admin-dashboard.tsx`
- `components/admin/reservation-table.tsx`
- `components/admin/day-calendar-view.tsx`
- `components/admin/assign-table-modal.tsx`
- `components/admin/create-modal.tsx`
- `components/admin/edit-modal.tsx`
- `components/booking-form.tsx`
- `components/reservation-provider.tsx`
- `lib/reservation-actions.ts`
- `lib/reservation-types.ts`
- `lib/restaurant.ts`
- `lib/supabase/*`
- `supabase/migrations/*`

## Verification Status

Last known green commands:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Production smoke check was run on a temporary `next start` server:

- `/admin` rendered dashboard/list/calendar.
- Booking bars no longer used `p` for party size.
- `/` rendered public booking form.

There is no `test` script yet.

## Recommended Next Step

Continue with live-Supabase QA, migration refinement, and production hardening instead of maintaining a parallel demo path.
