# Architecture - Backend Server

## Overview
The backend is a Node.js Express server written in TypeScript. It serves as an API gateway for the North Harbour Rugby Performance Hub, handling data persistence, AI analysis, file processing, and external service integrations.

## Technology Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL (Neon serverless)
- **AI Integration:** Google Gemini, Anthropic Claude, OpenAI GPT-4
- **Build Tool:** esbuild (for production bundling)
- **Development Tool:** tsx

## Server Architecture
The server is structured around Express middleware and route handlers.

- `server/index.ts`: The main entry point that initializes the Express app and HTTP server.
- `server/routes.ts`: The primary API router (Legacy/Comprehensive).
- `server/routes_minimal.ts`: A streamlined router for specific deployments.
- `server/db.ts`: Drizzle ORM configuration and database connection.
- `server/storage.ts`: Abstracted storage interface (currently using Drizzle/Postgres).
- `server/firebase-*.ts`: Specialized services and routes for Firebase (to be removed).

## Core Logic Modules
- **AI Analysis:** `aiAnalysis.ts`, `geminiAnalysis.ts`.
- **GPS Processing:** `statSportsGPS.ts`.
- **Data Ingestion:** `csv-parser.ts`, `xml-processor.ts`, `pdf-match-report-processor.ts`.
- **Integrations:** `googleSheets.ts`, `googleAuth.ts`.

## Data Persistence
The backend currently uses a dual-database approach:
1.  **PostgreSQL (Primary):** Managed via Drizzle ORM for structured rugby data, users, and sessions.
2.  **Firebase Firestore (Legacy):** Used for medical data, GPS workrate, and specialized performance metrics.

## Modernization Strategy (Next.js Transition)
- Transition from Express to Next.js API Routes (`app/api/*`).
- Consolidate all data into the PostgreSQL database.
- Port all business logic (AI, File Parsing) to Next.js server actions or API utilities.
- Remove all `firebase-*.ts` files and related dependencies.
- Remove Replit-specific environment configurations.
