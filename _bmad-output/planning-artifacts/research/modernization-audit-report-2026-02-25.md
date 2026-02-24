# Modernization Audit Report - North Harbour Rugby Intel Hub

## 1. Executive Summary
The North Harbour Rugby Intel Hub is in a transitional "Brownfield" state. While a robust **PostgreSQL/Drizzle** schema has been established, the application still relies heavily on **Express**, **Vite (SPA)**, and **Firebase**. This audit identifies all legacy components that must be removed or ported to achieve the "Next.js 15+ App Router" target architecture.

## 2. Legacy Dependency Inventory
| Package | Version | Purpose | Modernization Strategy |
| :--- | :--- | :--- | :--- |
| `express` | `^4.21.2` | Backend Framework | Replace with Next.js API Routes. |
| `firebase` | `^12.0.0` | Client-side Data | Port logic to Drizzle/Postgres. |
| `firebase-admin` | `^13.4.0` | Server-side Data | Port logic to Drizzle/Postgres. |
| `wouter` | `^3.3.5` | Client Routing | Replace with Next.js App Router. |
| `@replit/vite-plugin-*` | `^0.2.5` | Replit Dev Tools | Remove all Replit-specific plugins. |
| `vite` | `^5.4.14` | Client Build Tool | Replace with Next.js Turbopack. |

## 3. Legacy File Audit (Targets for Removal/Porting)

### 3.1. Firebase Services (20+ files)
- `server/firebase.ts`, `server/firebase-service.ts`: Core initialization.
- `server/firebase-routes-v2.ts`: Legacy API endpoints.
- `server/firebase-migration.ts`: One-time migration scripts.
- `shared/firebase-schema.ts`: Redundant schema definitions.

### 3.2. Framework Inconsistencies
- `server/index.ts`: The main Express server entry.
- `client/index.html`: The SPA entry point (Replace with Next.js `layout.tsx`).
- `client/src/main.tsx`: The SPA bootstrapper.

## 4. Modernization Readiness (Gaps Found)
1.  **HeadGuard Pro Schema:** Completed by adding `head_injury_incidents`, `concussion_assessments`, and `rtp_protocols` tables to Drizzle.
2.  **Agentic Architecture:** Missing "Coach", "Medical", and "Trainer" agents have been initialized.
3.  **Ingestion Persistence:** XML/GPS data is currently in-memory and needs to be migrated to the new PostgreSQL tables.
4.  **T3 Stack Initialization:** The `npx create-t3-app` command has not yet been executed in the main project root.

## 5. Next Steps Recommendation
1.  **Execute the Next.js Port:** Initialize a Next.js 15+ project and begin moving `client/src/pages` to `app/` routes.
2.  **Unify Ingestion:** Refactor `server/xml-upload-api.ts` to persist data in the new `match_performances` table.
3.  **Purge Firebase:** Systematically remove Firebase dependencies as their logic is ported to Drizzle.
4.  **Clean up Replit:** Remove all `.replit` and `replit.md` files once the Vercel deployment is verified.
