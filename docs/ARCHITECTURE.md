# Architecture — Maison Laurent Reservation App

## Overview

This is a **Next.js 16 App Router** web application for managing restaurant table reservations. It is a single-page application (SPA) built with React 19, TypeScript, Tailwind CSS v4, and shadcn/ui components.

The current version is **frontend-only** — all state is held in memory (via React Context). There is no backend or database integration yet.

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Framework    | Next.js 16 (App Router)             |
| Language     | TypeScript 5.7 (strict)             |
| Styling      | Tailwind CSS v4 + `tw-animate-css`  |
| UI Library   | shadcn/ui (Base UI primitives)      |
| Icons        | Lucide React                        |
| Fonts        | Geist Sans, Geist Mono, Playfair Display (Google Fonts) |
| Date Picker  | `react-day-picker` v10              |
| Toast        | `sonner`                            |
| Date Helpers | `date-fns`                          |
| Analytics    | `@vercel/analytics` (production only) |
| Package Mgr  | pnpm v11                            |

---

## Directory Structure

```
restaurant-reservation-app/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout: fonts, providers, metadata
│   ├── page.tsx                # Home page (Hero, Experience, Booking sections)
│   ├── globals.css             # Global styles & CSS design tokens
│   └── admin/                  # Admin panel route
│       └── page.tsx            # Admin dashboard
│
├── components/                 # React components
│   ├── booking-form.tsx        # 3-step booking wizard (Client Component)
│   ├── reservation-provider.tsx # Global state via React Context
│   ├── site-header.tsx         # Navigation header
│   ├── admin-dashboard.tsx     # Reservation management table (Client Component)
│   └── ui/                     # shadcn/ui primitive components
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── popover.tsx
│       ├── select.tsx
│       └── sonner.tsx
│
├── lib/                        # Shared utilities and constants
│   ├── restaurant.ts           # Restaurant constants, time slots, formatter functions
│   └── utils.ts                # Tailwind `cn()` utility (clsx + tailwind-merge)
│
├── public/                     # Static assets (images, icons)
├── next.config.mjs             # Next.js configuration
├── postcss.config.mjs          # PostCSS / Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── components.json             # shadcn/ui configuration
```

---

## Data Flow

```
ReservationProvider (React Context)
        │
        ├── reservations[]      ← In-memory array, seeded with mock data
        ├── addReservation()    ← Called by BookingForm on submit
        └── updateStatus()      ← Called by AdminDashboard to confirm/cancel
```

### Reservation Lifecycle

```
[Guest] → BookingForm (Step 1: Date/Time/Party)
                     → (Step 2: Guest Info)
                     → handleConfirm() → addReservation() → status: 'pending'

[Admin] → AdminDashboard → updateStatus(id, 'confirmed' | 'cancelled')
```

---

## Page Routes

| Route    | File                  | Description                          |
|----------|-----------------------|--------------------------------------|
| `/`      | `app/page.tsx`        | Public landing page + booking form   |
| `/admin` | `app/admin/page.tsx`  | Admin dashboard for managing reservations |

---

## Component Responsibilities

### `ReservationProvider` (`components/reservation-provider.tsx`)
- Single source of truth for all reservation data
- Provides `useReservations()` hook to child components
- Currently uses in-memory state (no persistence)

### `BookingForm` (`components/booking-form.tsx`)
- 3-step multi-step form: Date/Time → Guest Info → Confirmation
- Manages its own local form state
- Calls `addReservation()` on completion

### `AdminDashboard` (`components/admin-dashboard.tsx`)
- Displays all reservations in a sortable/filterable table
- Allows status updates (confirm / cancel)

### `lib/restaurant.ts`
- All restaurant-specific constants: `RESTAURANT`, `TIME_SLOTS`, `PARTY_SIZES`, `OCCASIONS`
- Date/time formatter functions: `formatTime()`, `formatDate()`, `formatDateLong()`

---

## Current Limitations

- **No persistence** — all data is lost on page refresh (in-memory React state)
- **No authentication** — the `/admin` route is publicly accessible
- **No backend API** — no server-side validation or email confirmation
- **No real payment/deposit flow**

---

## Planned Improvements

- [ ] Add a database (e.g., Supabase / Postgres) for persistent reservations
- [ ] Add authentication for the admin panel (e.g., NextAuth.js)
- [ ] Add server actions for form submission and status updates
- [ ] Send confirmation emails via a transactional email service (e.g., Resend)
- [ ] Add availability checking to prevent double-booking
