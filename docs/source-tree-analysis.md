# Source Tree Analysis - North Harbour Rugby Intel Hub

## Project Structure Overview

This project follows a multi-part architecture with a clear separation between the frontend (client) and backend (server), shared types and schemas, and BMad-specific configuration for AI orchestration.

```
north-harbour-rugby-intel-hub/
├── client/                 # Frontend React application (to be ported to Next.js)
│   ├── public/             # Static assets
│   └── src/
│       ├── components/     # UI components (Radix, Lucide, Tailwind)
│       ├── hooks/          # React hooks (Query, custom logic)
│       ├── lib/            # Utilities (API client, WebSocket, helpers)
│       └── pages/          # View components (Routing via Wouter)
├── server/                 # Backend Express application (to be ported to Next.js API)
│   ├── routes/             # API route handlers
│   └── [logic].ts          # Business logic (AI, PDF/XML processing, etc.)
├── shared/                 # Shared TypeScript types and Drizzle/Zod schemas
├── docs/                   # Project documentation and scan reports
├── _bmad/                  # BMad Core configuration and agent definitions
├── _bmad-output/           # Generated BMad artifacts (plans, implementations)
└── .agent/                 # Agent-specific workflows
```

## Critical Areas for Modernization

### 1. Firebase Removal Targets
The following files and folders contain logic that must be migrated to PostgreSQL and then deleted:

**Server-side:**
- `server/firebase.ts`: Firebase Admin initialization.
- `server/firebase-service.ts`: Core Firebase data operations.
- `server/firebase-routes.ts` & `server/firebase-routes-v2.ts`: Express endpoints for Firebase.
- `server/firebase-data-migration.ts`: Legacy migration logic.
- `server/firebase-storage.ts`: File handling in Firebase Storage.
- `server/csv-to-firebase-uploader.ts`: Batch data ingestion for Firebase.

**Shared/Schemas:**
- `shared/firebase-schema.ts`: Firebase Zod models.
- `shared/firebase-firestore-schema.ts`: Firestore-specific structural definitions.
- `shared/firebase.ts`: Frontend Firebase initialization.

**Client-side:**
- `client/src/pages/firebase-migration.tsx`: UI for managing migrations.
- Numerous components in `client/src/pages/` referencing `/api/firebase/*` (see `project-scan-report.json` for full list).

### 2. Replit Removal Targets
- `vite.config.ts`: Remove Replit plugins (`@replit/vite-plugin-cartographer`, etc.).
- `client/index.html`: Remove `replit-dev-banner.js` script.
- `client/src/lib/websocket.ts`: Refactor dynamic connection logic to use standard environment variables.

### 3. Next.js Migration Strategy
- **Routing:** Replace `wouter` in `client/` with Next.js App Router (`app/` directory).
- **APIs:** Port Express handlers from `server/` to Next.js API Routes (`app/api/`).
- **Data Fetching:** Maintain `TanStack Query` on the client or transition to Server Components for initial loads.
- **Database:** Standardize on the existing Drizzle/PostgreSQL (Neon) setup, ensuring all Firebase entities (Medical Notes, AI Analysis, etc.) are added to `shared/schema.ts`.

## Entry Points & Bootstrap
- **Frontend:** `client/src/main.tsx` (Current) → `app/layout.tsx` (Next.js Target).
- **Backend:** `server/index.ts` (Current) → Next.js API Routes (Next.js Target).
- **Database:** `server/db.ts` & `shared/schema.ts`.
