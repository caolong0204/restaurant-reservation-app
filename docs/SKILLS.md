# AI Developer Skills & Workflows

This document outlines the workflows and instructions for AI agents when performing specific engineering tasks in this repository.

---

## Skill 1: Adding a New Page Route

1. **Routing**: Under Next.js App Router, create a directory inside `app/` (e.g. `app/menu/`).
2. **Page File**: Create a `page.tsx` file inside that directory.
3. **Metadata**: Define and export a static metadata object:
   ```typescript
   export const metadata = {
     title: 'Menu | Maison Laurent',
     description: 'Explore our seasonal tasting menus.',
   }
   ```
4. **Layout**: If the route requires a distinct header/footer, add a `layout.tsx`. Otherwise, let it inherit the root layout.

---

## Skill 2: Creating a shadcn/ui Component

1. **Pre-requisite**: Check if the component is already in `components/ui/` or if you need to use `shadcn` CLI.
2. **Installation**: If you need to add a new primitive, run:
   ```bash
   pnpm dlx shadcn@latest add <component-name>
   ```
3. **Customization**: Do not override the base styles inside the generated UI files unless explicitly requested. Instead, wrap or style them using standard Tailwind utility classes in parent components.

---

## Skill 3: Managing Application State (e.g. Database integration)

If asked to integrate a database or server side database state:
1. **Schema**: Create a database schema matching the `Reservation` type in `components/reservation-provider.tsx`:
   - `id`: String/UUID (Primary Key)
   - `name`: Text
   - `email`: Text
   - `phone`: Text
   - `date`: Date/Text
   - `time`: Text
   - `partySize`: Integer
   - `occasion`: Text (Optional)
   - `notes`: Text (Optional)
   - `status`: Enum ('pending', 'confirmed', 'cancelled')
   - `createdAt`: Timestamp
2. **Context Layer**: Modify `ReservationProvider` to fetch from / mutate database values via API endpoints or Next.js Server Actions rather than using in-memory state.

---

## Skill 4: Verification and Testing

1. **Local Linting**: Always verify linting rules pass before finishing any code change:
   ```bash
   pnpm lint
   ```
2. **Build Verification**: Ensure the Next.js application builds successfully:
   ```bash
   pnpm build
   ```
3. **Hot Reload Testing**: Start the dev server using `pnpm dev` and check for console/terminal errors.
