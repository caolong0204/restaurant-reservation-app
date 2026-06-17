# AI Coding Rules & Best Practices

This document defines the rules, styling guidelines, and architectural standards that any AI coding assistant MUST follow when working on this codebase.

---

## 1. Stack & Technology Guidelines

- **Framework**: Next.js 16 App Router. Use React 19 rules for Server Components, Client Components, Suspense boundaries, and metadata exports.
- **TypeScript**: Keep the app strictly typed. Avoid `any`, `ts-ignore`, and broad casts unless there is a clear technical reason.
- **Styling**: Tailwind CSS v4. Align with tokens and variables in `app/globals.css`.
- **UI primitives**: The project uses Base UI/shadcn-style primitives. For Base UI `PopoverTrigger`, use the supported `render={<Button ... />}` pattern instead of `asChild`.
- **Icons**: Use `lucide-react` for common action/status icons.
- **Component model**:
  - Keep components modular and focused.
  - Use `use client` only for client interaction, hooks, browser state, or event listeners.
  - Prefer Server Components for static or server-fetched UI.

---

## 2. Directory & Structure Rules

- Page routes belong in `app/`.
- Shared reusable components belong in `components/` or `components/ui/`.
- Shared types, Server Actions, data adapters, schemas, and helper libraries belong in `lib/`.
- Reused booking domain types must live in `lib/reservation-types.ts`.
- Keep filenames consistent with the existing codebase:
  - Components: kebab-case or current local convention.
  - Helpers: kebab-case or current local convention.
- Documentation belongs in `docs/`.

---

## 3. State, Data Flow, And Mutability

- Admin and public booking flows use Server Actions in `lib/reservation-actions.ts` backed by Supabase.
- `ReservationProvider` is the client UI state bridge. It should call Server Actions and then sync local UI state from their returned values.
- Do not reintroduce localStorage or client-only persistence for core reservation data.
- Do not mutate reservation arrays or table arrays directly. Use immutable updates and preserve IDs, timestamps, and status transitions.
- Keep frontend booking rules aligned with the active Supabase schema and RPC behavior.

---

## 4. Booking Business Rules

- Guests do not choose tables.
- Public booking creates a `pending` reservation and does not hold table capacity.
- Only `confirmed` reservations assigned to table(s) block availability.
- Default service slots are selectable every 15 minutes.
- Admin table calendar should visually show 30-minute columns; off-grid starts such as `18:15` begin halfway inside the `18:00` cell.
- Admin calendar headers should show full-hour labels only to reduce visual noise.
- Operating cutoff:
  - Weekdays end at `22:00`.
  - Friday, Saturday, and Sunday can extend to `22:30`.
- Booking duration:
  - Party size 1-4: 120 minutes.
  - Party size 5-6: 150 minutes.
  - Party size 7+: 180 minutes.
- Pending reservations do not block overlap checks.
- Confirm flow must block insufficient table capacity unless admin chooses joined tables or manual outside-system arrangement.
- The manual outside-system arrangement option should be hidden when selected table capacity is already sufficient.

---

## 5. Admin UI Rules

- Admin list/table view is the primary operations view.
- Calendar/timeline view is the secondary planning view.
- Calendar empty cells should not render repeated "empty/available" text and should not use green background fills.
- Confirm/edit flows must make capacity problems explicit.
- If a booking card shows party size, use a person icon instead of a raw `p` suffix.
- Avoid excess whitespace in dense admin views. Prioritize scanability, sticky headers, stable row heights, and clear status badges.

---

## 6. Documentation & Comments

- Write clean, self-explanatory code. Avoid redundant comments that explain what the code does.
- Use comments to explain why something is written in a specific way, especially for workarounds, complex availability logic, or Next.js edge cases.
- Use JSDoc only for public exports, important helpers, or non-obvious domain logic.
- When changing booking rules, update the relevant docs in `docs/` in the same workstream.

---

## 7. Verification Gates

For code changes, run these before handoff unless the user explicitly asks to skip:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Notes:

- `pnpm build` can skip some type validation depending on Next.js config, so `pnpm exec tsc --noEmit` is required.
- There is currently no `pnpm test` script. Add focused tests for overlap, duration, and capacity rules where risk is highest.
- For frontend/admin UI changes, smoke test `/` and `/admin` in the browser.

---

## 8. UX, Animation & Layout Stability (Anti-Flicker)

- **Eliminate Layout Shifts (CLS)**: Always design layouts to prevent unexpected shifts (e.g., content moving up/down or left/right when dynamic content, loading states, or error messages load). Use fixed aspect ratios, reserved placeholders, skeleton loaders, or inline indicators instead of disruptive structural insertions.
- **Anti-Flicker & Loading States**: Do not insert block-level loaders that disrupt the visual layout. Place loading indicators (e.g., spinners) next to the trigger or category icons/labels horizontally to maintain stable visual heights and avoid content flickering.
