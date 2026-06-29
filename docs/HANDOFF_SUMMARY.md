# Handoff Summary

## Project Context

- Repository: `restaurant-reservation-app`
- Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Base UI/shadcn-style components, `sonner`, `lucide-react`
- Product: public booking flow plus `/admin` reservation operations dashboard
- Current mode: direct Supabase mode for public booking, admin auth, and reservation operations
- Current phase: v1 feature freeze.
- Next major step: QA hardening, live Supabase verification, and production polish.

## V1 Feature Freeze

Feature scope is frozen for v1 as of 2026-06-24. Do not add new product features until the release-hardening checklist is complete unless the change directly fixes a release blocker.

In scope for v1:

- Public booking flow.
- Pending reservation creation.
- Admin login and server-side route protection.
- Admin reservation list, search, filters, create, edit, cancel, and confirm flows.
- Main and joined table assignment.
- Capacity guard with manual arrangement override.
- Admin day calendar/table timeline.
- Table settings, staff account management, and operating hours settings.
- Supabase-backed persistence, RLS, and booking availability rules.

Deferred until after v1:

- Payments, deposits, or checkout.
- Customer accounts or guest login.
- Guest-selected tables.
- Marketing redesigns or new public content sections.
- Reporting/export workflows.
- Native mobile apps.
- Loyalty, CRM, or campaign tooling.
- New notification channels beyond the current confirmation email work.

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
- Monday is CLOSED (no bookings allowed).
- Weekday (Tue, Wed, Thu) cutoff: `21:00`.
- Friday/Saturday/Sunday cutoff: `21:30`.
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
- Admin settings & accounts:
  - Staff Accounts: Inline management replaced with Edit modals (change roles, disable, delete account with safety locks).
  - Table Settings: Manage restaurant tables ("Tên bàn", capacity, floor, delete table with safety locks).
  - Operating Hours: Adjust daily shifts, last booking slots, and footer display settings.

## Backend Status

- Supabase dependencies and helper files are wired into the app.
- Supabase migrations exist under `supabase/migrations`.
- Public booking, admin booking actions, admin login, and route protection now work directly against Supabase.

Fully synced and verified backend features:
- Duration rules implemented in SQL/RPC.
- Slot availability by party size fully functional.
- Main + secondary table overlap protection handled via Postgres trigger and assignments table.
- DB-level GIST exclusion constraints implemented to prevent double booking.
- RLS policies and staff authorization rules deployed.
- Public insert policies restrict anonymous inputs to pending reservations without direct table assignment.

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
pnpm test
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Production smoke check was run on a temporary `next start` server:

- `/admin` rendered dashboard/list/calendar.
- Booking bars no longer used `p` for party size.
- `/` rendered public booking form.

## Release-Hardening Checklist

- Run `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`, and `pnpm test:e2e`.
- Run live Supabase QA for public booking, admin login, confirm/assign, edit, cancel, overlap blocking, and capacity guard behavior.
- Add or complete Playwright coverage for admin confirm/table assignment, edit, cancel, and conflict handling.
- Run Supabase security/performance advisors and fix release-blocking RLS, policy, function, or index issues.
- Smoke test a production build with `next start`.

## Recommended Next Step

Continue with release hardening. New feature work should wait until v1 is verified and deployed.
