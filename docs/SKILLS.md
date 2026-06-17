# AI Developer Skills & Workflows

This document outlines repeatable workflows for AI agents working in this repository.

---

## Skill 1: Adding A New Page Route

1. Under the Next.js App Router, create a directory inside `app/`.
2. Add a `page.tsx` file inside that directory.
3. Add static metadata when the route is public or indexable:

   ```typescript
   export const metadata = {
     title: "Menu | Flambe",
     description: "Explore Flambe's reservation and dining experience.",
   }
   ```

4. Add a route-specific `layout.tsx` only if the page needs a distinct shell.
5. Keep public booking routes focused on the booking experience, not a marketing landing page.

---

## Skill 2: Creating Or Updating UI Components

1. Check existing components in `components/` and `components/ui/` before creating new primitives.
2. If adding a shadcn-style component, use the project convention and avoid rewriting generated primitive internals.
3. Use Tailwind utilities and variables from `app/globals.css`.
4. Use `lucide-react` for standard icons.
5. For Base UI popovers, use `PopoverTrigger` with the `render={<Button ... />}` pattern. Do not use unsupported `asChild` usage that breaks TypeScript.
6. Keep dense admin views compact and scannable. Avoid card-heavy layouts for operational tables.

---

## Skill 3: Booking Data And Server Actions

Use this flow when changing reservations, tables, availability, or assignment logic.

1. Update shared types in `lib/reservation-types.ts` first.
2. Keep all mutations behind Server Actions in `lib/reservation-actions.ts`.
3. Do not store core booking data only in client state or localStorage.
4. Preserve these current rules:
   - Public bookings start as `pending`.
   - Guests do not select tables.
   - Pending bookings do not block tables.
   - Only confirmed bookings assigned to table(s) block availability.
   - Duration is 120 minutes for 1-4 guests, 150 minutes for 5-6 guests, and 180 minutes for 7+ guests.
   - Insufficient capacity must be blocked unless admin joins tables or marks manual outside-system arrangement.
5. When changing status or assignment, return the updated reservation list/table state so the UI can sync deterministically.

---

## Skill 4: Supabase/Postgres Integration

Use this flow when changing the live backend contract or schema.

1. Treat current SQL migrations as the active backend history and keep them synced with frontend booking rules.
2. Model reservations with enough structure for:
   - Main table assignment.
   - Optional secondary/joined tables.
   - Manual outside-system arrangement flag or equivalent audit field.
   - Party-size-based duration.
   - Pending reservations without table holds.
3. Enforce overlap checks for confirmed reservations on main and joined tables.
4. Use Supabase Auth for `/admin`; protect admin routes server-side.
5. Enable RLS on sensitive tables. Only active staff should read or mutate admin data.
6. Public booking should use Server Actions and should not expose direct browser reads of `reservations`.
7. Keep public booking behind Server Actions; do not expose direct browser reads of reservations.

---

## Skill 5: Admin Calendar And Assignment UI

Use this flow when changing `/admin` booking operations.

1. Keep the row/list reservation table as the primary operating view.
2. Keep the calendar/timeline as a secondary view for availability and table planning.
3. Calendar timeline rules:
   - Show columns every 30 minutes.
   - Show only full-hour header labels.
   - Start `:15` and `:45` bookings halfway inside the adjacent 30-minute cell.
   - Booking bars should span their full duration without internal borders.
   - Empty cells should remain visually quiet: no repeated text and no green fill.
   - Party size should use a person icon, not a `p` suffix.
4. Operating cutoff:
   - Weekdays end at `22:00`.
   - Friday, Saturday, and Sunday can extend to `22:30`.
5. Confirm drawer/modal must clearly block capacity shortages unless joined tables or manual arrangement is selected.
6. Hide the manual arrangement checkbox when selected capacity is already enough.

---

## Skill 6: Verification And Testing

For code changes, run:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Frontend smoke checks:

- Public booking wizard renders and can submit a pending reservation through Supabase.
- `/admin` list view shows reservations and admin actions.
- `/admin` calendar view shows table rows, compact 30-minute columns, booking duration bars, and no raw `p` suffix.
- Confirm flow blocks overlapping confirmed reservations and insufficient capacity.

Notes:

- There is currently no `pnpm test` script.
- Before backend work, add focused tests for duration calculation, overlap checks, capacity guard, and joined-table assignment.
