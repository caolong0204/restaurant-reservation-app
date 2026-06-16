# Handoff Summary

## Project Context

- Repository: `restaurant-reservation-app`
- Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui-style components, `sonner`, `lucide-react`
- Current product: public restaurant booking flow plus `/admin` dashboard
- Initial state: frontend-only booking/admin with React Context and local browser storage
- Target direction: polished row-based admin UI first, then Supabase/Postgres/Auth integration

## Product Decisions

- Public booking keeps the existing 4-step wizard.
- Admin should be optimized for row-based operations similar to the spreadsheet reference from the client.
- Admin v1 should use reservations list as the primary workflow.
- Day calendar can remain a secondary view for seeing bookings by time slot.
- Guests do not choose tables.
- New guest bookings are `pending` and do not reserve/hold a table.
- Admin assigns a table when confirming a booking.
- Only `confirmed` bookings with a `table_id` occupy a table.
- Booking service window is 120 minutes for table conflict checks.
- Service slots stay from `10:00` to `21:00`.
- Email notifications, payments/deposits, customer accounts, and guest table selection are out of scope for v1.

## Admin UI Direction

The client provided a spreadsheet-style admin reference where each reservation is a dense row with columns like date, time, name, phone, party size, assigned table, status, source, and operational check.

Recommended implementation direction:

- Build a dense table/row view as the main admin screen.
- Add sticky column headers and compact filters.
- Include quick status and table assignment actions in each row.
- Keep colors functional: confirmed, pending, cancelled, missing table, missing date, OK.
- Calendar/day view should support overflow for many bookings in the same time slot, but it should not replace the row-first operations screen.

## Backend Plan

- Use Supabase Postgres for persistence.
- Use Supabase Auth for staff/admin access.
- Use `@supabase/ssr` and `@supabase/supabase-js`.
- Use cookie-based Supabase SSR clients.
- Add `proxy.ts` for session refresh.
- Protect `/admin` with Supabase Auth when env vars are configured.
- Keep demo mode/fallback available when Supabase env vars are missing so UI QA can continue locally.

## Data Model

Core tables:

- `staff_profiles`: staff auth user id, display name, role, active flag.
- `restaurant_tables`: seeded table inventory with code, floor/area, capacity, active flag, sort order, notes.
- `reservations`: guest info, date/time, party size, occasion, requested area, notes, status, nullable table id, timestamps.

Default table seed:

- 14 total tables.
- Floor 1: 8 small/medium tables.
- Floor 2: 6 larger/private-room tables.

Conflict rule:

- A confirmed booking blocks the assigned table for 120 minutes from `reservation_date + reservation_time`.
- Pending bookings do not block table availability.

## Files Already Created Or Planned

- `docs/IMPLEMENTATION_PLAN.md`: full implementation plan.
- `docs/SUPABASE_SETUP.md`: Supabase setup instructions.
- `docs/HANDOFF_SUMMARY.md`: this file.
- `supabase/migrations/20260616000000_reservation_core.sql`: planned Supabase schema, RLS, RPC, table seed.
- `lib/reservation-types.ts`: shared booking/domain types.
- `lib/table-seed.ts`: default table inventory for demo mode.
- `lib/reservation-demo-store.ts`: server-memory demo data fallback.
- `lib/reservation-actions.ts`: Server Actions for public booking and admin operations.
- `lib/supabase/*`: Supabase config/client/server/proxy helpers.
- `lib/auth-actions.ts`: admin sign-in/sign-out actions.
- `components/admin/assign-table-modal.tsx`: table assignment modal.
- `components/admin/day-calendar-view.tsx`: secondary calendar/day view.

## Verification Needed

The refactor may be mid-flight. The next engineer/AI should:

- Run `pnpm lint`.
- Run `pnpm build`.
- Fix any TypeScript/import/interface errors from the provider and admin dashboard refactor.
- Verify public booking still submits successfully in demo mode.
- Verify admin row workflow supports pending, confirm with table assignment, cancel, edit, delete.
- Verify overlapping confirmed reservations cannot use the same table.
- Verify Supabase Auth route protection after env vars are configured.

## Useful Existing Docs

- `docs/ARCHITECTURE.md`
- `docs/RULES.md`
- `docs/SKILLS.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/SUPABASE_SETUP.md`
