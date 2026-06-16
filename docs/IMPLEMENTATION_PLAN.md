# Restaurant Reservation App Implementation Plan

## Current Status

- Frontend/admin polish phase is mostly complete.
- The app currently runs in demo mode using Server Actions plus `lib/reservation-demo-store.ts`.
- Supabase/Postgres/Auth code and migrations exist, but DB has **not** been deployed yet. Treat SQL migrations as drafts that must be synced before the BE phase.
- Validation gate is currently green:
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`
  - `pnpm build`
- There is no `test` script yet.

## Product Decisions

- Guests do not choose tables.
- New guest bookings are `pending` and do not hold tables.
- Only `confirmed` bookings with assigned tables block table availability.
- Admin list view is the primary operations screen.
- Calendar/table timeline is a secondary day view for checking table occupancy and availability.
- Email, payment/deposit, customer accounts, native mobile apps, and guest table selection are out of scope for v1.

## Business Rules

- Restaurant: Flambé
- Address: 23 Gia Ngư, Hà Nội
- Hotline: 0927355656
- Current demo table inventory: 17 active tables.
- Booking slots are 15-minute selectable slots in the public/admin forms.
- Day calendar shows 30-minute grid cells and only labels full hours to reduce visual noise.
- Operating cutoff:
  - Weekdays: last visible/booking cutoff is `22:00`.
  - Friday, Saturday, Sunday: last visible/booking cutoff is `22:30`.
- Booking duration:
  - 1-4 guests: 120 minutes.
  - 5-6 guests: 150 minutes.
  - 7+ guests: 180 minutes.
- Large-party assignment:
  - If selected tables have enough total capacity, admin can confirm normally.
  - If selected tables are short on capacity, admin must either select extra joined tables or explicitly tick "Tự sắp xếp thêm ghế / bàn phụ ngoài hệ thống".
  - The manual-arrangement checkbox is hidden when capacity is already sufficient.

## Frontend Scope Completed

- Public booking wizard:
  - Party size, date, time, info, success.
  - Loading/error handling for slot availability.
  - Success feedback after submit.
- Admin dashboard:
  - Dense row/table reservation view.
  - Search, status filter, date filter.
  - Create manual booking.
  - Edit booking.
  - Cancel booking.
  - Confirm booking with table assignment.
  - Day calendar/table timeline.
  - Booking bar shows party size with a people icon, not `p` text.
- Demo overlap behavior:
  - Pending bookings do not block tables.
  - Confirmed bookings block main and secondary/joined tables.

## Backend Phase Plan

Before deploying Supabase, sync these items with the current FE/demo logic:

1. Duration rules:
   - DB/RPC/migrations must use `<=4 => 120`, `<=6 => 150`, `7+ => 180`.
2. Slot availability:
   - RPC must respect requested party size.
   - Public availability should not count pending bookings as occupied.
3. Secondary tables:
   - Decide whether `secondary_table_ids` stays as text, becomes `uuid[]`, or becomes a join table.
   - Add DB-level protection against double-booking secondary/joined tables.
4. Auth:
   - Keep `/admin` protected only when Supabase env vars are configured.
   - Active staff check remains required for admin actions.
5. RLS:
   - Public can only insert pending reservations with no assigned table.
   - Active staff can read/mutate admin data.
6. Demo mode:
   - Keep demo mode available when Supabase env vars are missing.

## Test Plan Before BE Merge

- Required commands:
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`
  - `pnpm build`
- Add automated tests before or during BE phase:
  - Duration calculation.
  - Overlap detection.
  - Pending bookings not occupying tables.
  - Main + secondary table blocking.
  - Capacity guard for large-party assignment.
  - Public slot availability by party size.
- Manual QA:
  - Guest booking appears in admin as pending.
  - Pending booking does not occupy a table in calendar.
  - Admin can confirm with enough capacity.
  - Admin cannot confirm short capacity without joined tables or manual override.
  - Calendar shows table timeline correctly through weekday/weekend cutoff.
  - `/admin` redirects to login once Supabase Auth is configured.

## Acceptance Criteria

- Admin can enter and manage one booking in under 30 seconds.
- Search by phone/name/table is usable from row view.
- Staff can see table availability in the day timeline without reading empty-cell text.
- Confirm flow prevents obvious short-capacity mistakes.
- No TypeScript, lint, or production build failures before BE work starts.
