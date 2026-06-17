# Restaurant Reservation App Implementation Plan

## Current Status

- Frontend/admin polish phase is mostly complete.
- The app now runs directly against Supabase for public booking, admin auth, and reservation operations.
- Supabase/Postgres/Auth code and migrations are already wired into the current app.
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
- Live availability behavior:
  - Pending bookings do not block tables.
  - Confirmed bookings block main and secondary/joined tables.

## Current Backend Focus (Completed)

All backend features are fully implemented and integrated against the live Supabase flow:

1. **Duration rules**: Migrations and RPC functions enforce local Vietnam timezone operating rules and duration categories based on party size: `<=4 => 120` min, `<=6 => 150` min, `7+ => 180` min.
2. **Slot availability**: Checks respect requested party size and ignore pending/cancelled bookings.
3. **Secondary tables**: Implemented via a sync trigger in Postgres that maps comma-separated `secondary_table_ids` into the `reservation_table_assignments` join table, protected by a GIST constraint to block overlapping bookings on primary/secondary tables.
4. **Auth**: The `/admin` routes are protected on the server side via middleware and cookie refreshing, requiring active staff permissions.
5. **RLS Policies**: Restrict public users to inserting pending reservations only. Active staff have full CRUD access.

## Test Plan

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
  - `/admin` redirects to login when session is missing.

## Acceptance Criteria

- Admin can enter and manage one booking in under 30 seconds.
- Search by phone/name/table is usable from row view.
- Staff can see table availability in the day timeline without reading empty-cell text.
- Confirm flow prevents obvious short-capacity mistakes.
- No TypeScript, lint, or production build failures before BE work starts.
