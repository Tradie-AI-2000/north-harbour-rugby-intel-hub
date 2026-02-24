# Development Guide - North Harbour Rugby Intel Hub

## Prerequisites

- **Node.js:** v20+ (Active LTS)
- **TypeScript:** v5.6+
- **Database:** PostgreSQL (Neon serverless or local instance)
- **Frameworks:** React 18 (Current), Next.js (Target)
- **ORM:** Drizzle ORM
- **Package Manager:** npm

## Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone [repository-url]
    cd north-harbour-rugby-intel-hub
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory and configure the following variables (refer to `.env.example` if available):
    ```env
    DATABASE_URL=postgres://user:password@host:port/dbname
    GOOGLE_GENAI_API_KEY=your-api-key
    ANTHROPIC_API_KEY=your-api-key
    OPENAI_API_KEY=your-api-key
    FIREBASE_PROJECT_ID=your-project-id (Currently used, to be removed)
    ```

4.  **Database Migration:**
    Push the Drizzle schema to your database:
    ```bash
    npm run db:push
    ```

## Development Workflow

- **Run Development Server:**
  ```bash
  npm run dev
  ```
  This command starts the Express backend via `tsx` and the Vite frontend dev server.

- **Frontend Development:**
  Located in `client/src/`. Uses Radix UI, Tailwind CSS, and TanStack Query.

- **Backend Development:**
  Located in `server/`. Express routes are defined in `server/routes.ts` and `server/routes/`.

- **Type Checking:**
  ```bash
  npm run check
  ```

## Testing

- **End-to-End Tests:**
  Uses Playwright for browser testing.
  ```bash
  npx playwright test
  ```

## Build & Deployment

- **Build for Production:**
  ```bash
  npm run build
  ```
  This builds the frontend into `dist/` and bundles the server using `esbuild`.

- **Start Production Server:**
  ```bash
  npm run start
  ```

## Upcoming Architectural Shift (Next.js Transition)

As part of the modernization project, we are transitioning from a separate Express/Vite setup to a unified Next.js App Router architecture.

**Key Objectives:**
- Port `client/src/pages/` to `app/` routes.
- Move Express handlers in `server/` to `app/api/` routes.
- Remove all Firebase and Replit-specific logic and dependencies.
- Standardize all data storage on PostgreSQL (Neon) using Drizzle.
