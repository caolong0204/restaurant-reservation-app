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
  -> reservation Server Actions
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
| `lib/reservation-actions.ts` | Server Actions for public/admin operations |
| `lib/restaurant.ts` | Restaurant constants, slots, date/time helpers |
| `lib/supabase/server.ts` | Cookie-based Supabase SSR client |
| `lib/supabase/client.ts` | Browser Supabase client |
| `lib/supabase/proxy.ts` | Session refresh helper |
| `lib/auth-actions.ts` | Admin sign-in/sign-out |

## Known Gaps

- No automated unit/e2e tests yet.
- No email or payment flow.
- No report/export flow yet.
- No persisted audit trail for manual capacity override.

## Required Verification

Before finishing changes:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

For rendered UI changes, smoke test:

- `/` public booking form renders.
- `/admin` list renders.
- `/admin` calendar renders.
- Confirm/edit capacity guard works for short-capacity bookings.
