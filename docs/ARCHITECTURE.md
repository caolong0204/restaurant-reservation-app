# Architecture — Flambé Reservation App

## Overview

This is a Next.js 16 App Router application for restaurant table reservations.

The app currently has:

- Public booking experience at `/`.
- Staff/admin operations dashboard at `/admin`.
- Supabase-backed data flow through Server Actions and RPC/table access.
- Supabase helper code and linked migrations for the live backend phase.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19 |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS v4 |
| UI primitives | Base UI / shadcn-style local components |
| Icons | Lucide React |
| Toasts | Sonner |
| Date picker | React Day Picker |
| Unit tests | Vitest |
| Browser E2E / smoke tests | Playwright |
| Backend target | Supabase Postgres + Supabase Auth |
| Package manager | pnpm |

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Public restaurant page and booking wizard |
| `/admin` | Staff/admin reservation operations |
| `/admin/login` | Supabase Auth login page for staff/admin |

## Main Data Flow

```text
Public BookingForm
  -> useReservations().addReservation()
  -> createReservation Server Action
  -> Supabase reservations insert
  -> pending reservation

AdminDashboard
  -> useReservations()
  -> reservation Server Actions (compat entrypoint)
  -> Supabase
  -> local provider state upsert
```

## Runtime Configuration

The app now expects these env vars to exist:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

- `/admin` is protected by `proxy.ts`.
- Staff must exist in `staff_profiles` and be active.
- Server Actions use Supabase tables/RPCs.
- The current Supabase SQL is the active backend source of truth and should be kept in sync with frontend rules.

## Core Domain Types

Shared reservation/table types live in `lib/reservation-types.ts`.

Important types:

- `Reservation`
- `ReservationStatus`
- `RestaurantTable`
- `ReservationInput`
- `SlotAvailability`

## Booking Rules

- New public bookings are `pending`.
- Pending bookings do not occupy tables.
- Confirmed bookings occupy assigned main and secondary tables.
- Guests never choose tables.
- Admin must assign tables when confirming.
- Large-party capacity guard is enforced in the confirm and edit UI.

Duration rules:

- 1-4 guests: 120 minutes.
- 5-6 guests: 150 minutes.
- 7+ guests: 180 minutes.

Operating cutoff:

- Weekdays: `22:00`.
- Friday/Saturday/Sunday: `22:30`.

## V1 Scope Freeze

Feature scope is frozen for v1 as of 2026-06-24. Architecture changes should now be limited to release blockers, testability improvements, security fixes, and production hardening.

V1 includes:

- Public booking and pending reservation creation.
- Supabase-backed admin login and route protection.
- Admin reservation operations.
- Main and joined table assignment.
- Capacity guard and manual arrangement override.
- Admin calendar/table timeline.
- Staff accounts, table settings, and operating hours settings.

Post-v1 candidates:

- Payments/deposits.
- Customer accounts.
- Guest-selected tables.
- Reporting/export.
- Native mobile apps.
- Loyalty/CRM/campaign tooling.
- Larger marketing redesigns or additional public sections.

## Important Components

| File | Responsibility |
| --- | --- |
| `components/booking-form.tsx` | Public booking wizard shell |
| `components/booking/*` | Booking wizard step components |
| `components/reservation-provider.tsx` | Client context wrapping Server Actions |
| `components/admin-dashboard.tsx` | Admin page state and composition |
| `components/admin/reservation-table.tsx` | Dense row operations view |
| `components/admin/day-calendar-view.tsx` | Table timeline calendar |
| `components/admin/assign-table-modal.tsx` | Confirm/table assignment flow |
| `components/admin/create-modal.tsx` | Manual booking creation |
| `components/admin/edit-modal.tsx` | Edit existing booking |

## Important Server/Lib Files

| File | Responsibility |
| --- | --- |
| `lib/reservation-actions.ts` | Thin compatibility entrypoint for Server Actions used by current UI |
| `lib/reservations/queries.ts` | Reservation reads, snapshot loading, RPC availability queries |
| `lib/reservations/mutations.ts` | Reservation create/edit/confirm/cancel/delete mutations |
| `lib/reservations/validators.ts` | Reservation input and table-capacity validation |
| `lib/reservations/mappers.ts` | DB/RPC row to app model mapping |
| `lib/auth/guards.ts` | Shared staff access guard for admin-facing Server Actions |
| `lib/hooks/use-admin-reservation-filters.ts` | Admin filter state and derived reservation list |
| `lib/hooks/use-admin-reservation-actions.ts` | Admin modal state and reservation action orchestration |
| `lib/admin-calendar.ts` | Timeline/grid math for the admin day calendar |
| `lib/restaurant.ts` | Restaurant constants, slots, date/time helpers |
| `lib/supabase/server.ts` | Cookie-based Supabase SSR client |
| `lib/supabase/client.ts` | Browser Supabase client |
| `lib/supabase/proxy.ts` | Session refresh helper |
| `lib/auth-actions.ts` | Admin sign-in/sign-out |

## Known Gaps

- Unit tests hiện đã có cho booking time rules và admin calendar timeline math, nhưng chưa có test cho server actions hoặc UI integration.
- Playwright hiện cover smoke cho `/`, `/admin` redirect, `/admin/login`, và public booking happy path. Live admin login flow cũng đã có test nhưng chỉ chạy khi set `PLAYWRIGHT_ADMIN_EMAIL` và `PLAYWRIGHT_ADMIN_PASSWORD`.
- Chưa có Playwright flow cho confirm/gán bàn, edit reservation, hoặc conflict handling trong admin.
- No email or payment flow.
- No report/export flow yet.
- No persisted audit trail for manual capacity override.
- Chưa có test riêng cho `ReservationProvider`, admin filter hooks, hoặc Supabase-backed server actions.

## Required Verification

Before finishing changes:

```bash
pnpm test
pnpm exec tsc --noEmit
pnpm lint
pnpm build
pnpm test:e2e
```

For rendered UI changes, smoke test:

- `/` public booking form renders.
- Public booking happy path đi đến success state.
- `/admin` list renders.
- `/admin` calendar renders.
- `/admin/login` login form renders và live login flow pass khi có staff credentials.
- Confirm/edit capacity guard works for short-capacity bookings.
