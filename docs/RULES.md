# AI Coding Rules & Best Practices

This document defines the rules, styling guidelines, and architectural standards that any AI coding assistant MUST follow when working on this codebase.

---

## 1. Stack & Technology Guidelines

- **Framework**: Next.js 16 (App Router). Use React 19 rules (e.g. Server vs Client Components, Suspense boundaries, metadata exports).
- **TypeScript**: Strictly typed. Avoid using `any` or `ts-ignore`. Every function parameter and return type must be explicitly typed.
- **Styling**: Tailwind CSS v4. Ensure all styles align with Tailwind's utility classes and design variables in `app/globals.css`. Do NOT write custom inline styles or arbitrary CSS unless Tailwind classes are insufficient.
- **Component Model**:
  - Keep components modular, focused, and small (< 150 lines preferred).
  - Use `use client` strictly when client interaction (state, hooks, event listeners) is required.
  - Favor Server Components for rendering static or server-fetched data.

---

## 2. Directory & Structure Rules

- All page routes belong in `app/`.
- All shared, reusable components belong in `components/` or `components/ui/`.
- All types, schemas, and helper libraries belong in `lib/`. Do not define types inline inside component files if they are reused across files.
- Keep filenames clean:
  - Component files: kebab-case (e.g., `booking-form.tsx`) or matching existing components (e.g. `admin-dashboard.tsx`).
  - Helper files: `snake_case` or `kebab-case` (e.g., `utils.ts`, `restaurant.ts`).

---

## 3. State Management & Data Mutability

- Currently, all states are managed via `ReservationProvider` (React Context) in memory.
- When modifying reservation state:
  - Do NOT mutate state directly (e.g. `reservations.push(...)` is strictly forbidden). Always use immutable updates (e.g. `setReservations(prev => [newReservation, ...prev])`).
  - Always keep key properties intact like IDs and createdAt timestamps.
- If introducing databases (e.g. Supabase, Prisma) or Server Actions, ensure state changes are synchronized with the database and revalidated using `revalidatePath` or `revalidateTag`.

---

## 4. Documentation & Comments

- Write clean, self-explanatory code. Avoid redundant comments that explain *what* the code does.
- Use comments to explain *why* something is written in a specific way, particularly for workarounds, complex algorithms, or Next.js edge cases.
- Use JSDoc comments (`/** ... */`) for documenting public exports, functions, and interfaces in `lib/` and `components/`.

---

## 5. Coding Standards

- **Formatting**: Always format code using standard Prettier settings.
- **Imports**: Organize imports logically:
  1. React & Next.js imports
  2. Third-party packages (lucide-react, sonner, etc.)
  3. Context providers / custom hooks
  4. Local components
  5. Libs, utilities, and assets
- **Async/Await**: Always use `async`/`await` for asynchronous flows. Handle promise rejections gracefully with try-catch blocks and display readable feedback to the user via `sonner` toasts.
