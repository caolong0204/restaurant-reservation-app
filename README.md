# Maison Laurent — Restaurant Reservation App

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app). It serves as a modern fine-dining reservation portal and admin dashboard.

---

## AI Developer Context (Best Practices)

To ensure consistency and velocity when working with AI coding assistants, we have defined the following documentation:

- 📊 **[Architecture Details](docs/ARCHITECTURE.md)**: Overall application layers, tech stack, data flows, and component responsibilities.
- 📐 **[Coding Rules](docs/RULES.md)**: Code conventions, TypeScript guidelines, and CSS conventions.
- 🔧 **[Developer Skills & Workflows](docs/SKILLS.md)**: Step-by-step instructions for tasks like adding pages, components, or integrating databases.

Please prompt any AI assistant to read these files before starting new tasks.

---

## Getting Started

This project uses **pnpm** as its package manager. Follow the steps below to set up and run:

### 1. Install Dependencies
```bash
pnpm install
```

> **Note:** If you encounter `[ERR_PNPM_IGNORED_BUILDS]` regarding `msw` or `sharp`, you need to approve their builds by running:
> ```bash
> pnpm approve-builds
> ```

### 2. Run the Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port specified in terminal output if 3000 is occupied) with your browser to view the application.

---

## Features Built
- **Landing Page**: Immersive design for Maison Laurent restaurant.
- **Reservation Booking Flow**: 3-step validation form for reserving tables.
- **Admin Dashboard**: Accessible at `/admin` to list, sort, filter, and manage reservation statuses.
