---
stepsCompleted: ['step-01-init', 'step-02-context', 'step-03-starter', 'step-04-decisions', 'step-05-patterns']
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/research/technical-nextjs-migration-research-2026-02-25.md'
  - 'docs/index.md'
  - 'docs/project-overview.md'
  - 'docs/source-tree-analysis.md'
  - 'docs/architecture-client.md'
  - 'docs/architecture-server.md'
  - 'docs/development-guide.md'
  - 'docs/api-contracts.md'
  - 'docs/data-models.md'
  - 'docs/project-parts.json'
workflowType: 'architecture'
project_name: 'north-harbour-rugby-intel-hub'
user_name: 'Joeward'
date: '2026-02-25'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- **Unified Ingestion Engine:** Architecting high-throughput Route Handlers to ingest and migrate raw Match XML and GPS CSV data into a relational PostgreSQL schema.
- **Role-Specific AI Sidecars:** Implementing an agentic layer where dedicated AI agents (Coach, Analyst, Medical, Trainer) utilize specialized `skills.md` definitions to perform tactical simulations and ETL automation.
- **The "God-Like" View:** Creating a top-down organizational overview for senior management using React Server Components to aggregate technical, physical, mental, and medical performance data.
- **HeadGuard Pro Integration:** Porting the concussion management system into the unified framework, ensuring real-time RTP interlocks.

**Non-Functional Requirements:**
- **Extreme Responsiveness:** Sub-2s LCP and sub-1.5s TTFB for dashboards.
- **Data Integrity:** 100% verification match during NoSQL-to-SQL migration.
- **Agentic Scalability:** Supporting simultaneous multi-agent execution.
- **Privacy & Security:** HIPAA-level encryption for medical and mental performance data.

**Scale & Complexity:**
- Primary domain: High-Performance Sport (Rugby Union) / Healthcare
- Complexity level: High
- Estimated architectural components: 12+

### Technical Constraints & Dependencies

- **Platform Target:** Vercel (Production) with Next.js 15+ App Router.
- **Database:** PostgreSQL (Neon or Supabase) with Drizzle ORM abstraction.
- **Modernization Gap:** Removal of Replit plugins and Firebase Admin SDK dependencies.

### Cross-Cutting Concerns Identified

- **Agent Orchestration:** Managing agent "sidecars" and their specialized skills.
- **Unified Schema:** Linking mental performance to technical game stats and medical clearance.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack Web Application (Next.js App Router) based on project requirements analysis.

### Starter Options Considered

1.  **Vercel Next.js Analytics Starter:** Excellent for Core Web Vitals and dashboard layout, but lacks built-in Drizzle/Postgres integration.
2.  **Modern T3 Stack (2026 Edition):** The "Gold Standard" for type-safe Next.js development. Provides a modular setup with Drizzle, Auth.js, and Tailwind CSS.
3.  **Custom Scaffolding (`create-next-app`):** Maximum control but requires manual configuration of Drizzle, Auth, and the Agentic layer.

### Selected Starter: Modern T3 Stack

**Rationale for Selection:**
The T3 stack provides the most robust, type-safe foundation for high-complexity applications. Its native support for **Drizzle ORM** allows the project to remain **Database Agnostic**, easily switching between **Neon** and **Supabase** during the MVP phase. Furthermore, its modular CLI allows us to include **Auth.js** and **Tailwind CSS** out-of-the-box, accelerating the path to a production-ready client demo on Vercel.

**Initialization Command:**

```bash
npx create-t3-app@latest --appRouter --drizzle --nextAuth --tailwind --ts
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript v5.6+ on Node.js v20+, ensuring end-to-end type safety from the database schema to the React components.

**Styling Solution:**
Tailwind CSS v4 with `shadcn/ui` components, providing a consistent, high-performance UI library optimized for sports dashboards.

**Build Tooling:**
Next.js Turbopack for development and the Rust-based compiler for production builds, delivering the sub-2s performance required by coaching staff.

**Testing Framework:**
Pre-configured for Playwright integration, ensuring critical user journeys (e.g., RTP validation) are verified automatically.

**Code Organization:**
Feature-based folder structure within the `app/` directory, facilitating the colocation of role-specific AI skills and pages.

**Development Experience:**
Neon Database Branching integration, allowing for isolated schema development and safe NoSQL-to-SQL migration dry runs.

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- **Primary Database:** **Neon PostgreSQL** selected for its superior economical scale-to-zero model for development branches, crucial for keeping MVP costs low.
- **Data Model:** **Hybrid Normalization** using Drizzle. Normalizing core entities (Players, Teams, Matches) while utilizing `jsonb` for flexible AI-generated insights and mental performance logs.
- **Authentication:** **Auth.js (v5)** using the Drizzle adapter, ensuring secure, Next.js-native session management from Day 1.

**Important Decisions (Shape Architecture):**
- **Data Ingestion:** **Next.js Route Handlers** with `multipart/form-data` support for large XML/GPS file uploads, bypassing serverless body-size limits by using streaming uploads where possible.
- **Agent Execution:** **Inngest** for background job orchestration. This prevents long-running AI tactical simulations from timing out on Vercel's standard function limits.

**Deferred Decisions (Post-MVP):**
- **Multi-Club Tenancy:** While the schema will include a `clubId` field, the full multi-tenant routing logic is deferred until after the North Harbour client demo.

### Data Architecture

- **Database:** Neon PostgreSQL (Serverless).
- **ORM:** Drizzle ORM (v0.39+).
- **Migration Strategy:** `drizzle-kit push` for rapid prototyping; SQL-based migrations for production.
- **Validation:** Zod (v3.24+) for end-to-end schema safety.

### Authentication & Security

- **Provider:** Auth.js (NextAuth) with GitHub/Google OAuth and Email Magic Links.
- **Session Store:** Database-backed sessions via the Drizzle adapter in PostgreSQL.
- **Encryption:** AES-256 for PII (Personal Identifiable Information) in sensitive medical note columns.

### API & Communication Patterns

- **Internal Mutations:** Next.js **Server Actions** exclusively.
- **External/Heavy Processing:** **Route Handlers** (`/api/*`).
- **Real-time Updates:** **React Query Polling** (5s intervals) selected over WebSockets to reduce MVP infrastructure complexity.

### Infrastructure & Deployment

- **Hosting:** **Vercel** (Production/Preview).
- **CI/CD:** Vercel for Frontend/API; `drizzle-kit` within GitHub Actions for schema sync.
- **Monitoring:** **Sentry** for full-stack error tracking and performance profiling.

### Decision Impact Analysis

**Implementation Sequence:**
1. Initialize T3 Scaffold and configure Neon DB.
2. Define the core Drizzle schema (Users, Players, Matches).
3. Implement Auth.js and secure the `/dashboard` route.
4. Build the XML/GPS Ingestion Route Handler.
5. Create the "God-Like" Organizational Dashboard.

**Cross-Component Dependencies:**
The **Analyst Agent** depends on the Ingestion Route Handler logic, while the **Coach Agent** depends on the successful population of the relational PostgreSQL tables by the Analyst Agent.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
5 areas where AI agents could make different choices if not strictly governed.

### Naming Patterns

**Database Naming Conventions:**
- **Tables:** `snake_case`, plural (e.g., `rugby_players`, `match_performances`).
- **Columns:** `snake_case` (e.g., `jersey_number`, `is_cleared`).
- **Foreign Keys:** `referenced_table_id` (e.g., `player_id`).

**API Naming Conventions:**
- **Route Handlers:** `/api/[resource]` (e.g., `/api/ingestion`).
- **Server Actions:** `camelCase` starting with action (e.g., `submitWellnessData`, `calculateTwi`).

**Code Naming Conventions:**
- **Components:** `PascalCase` (e.g., `SquadReadinessDashboard`).
- **Files:** `kebab-case` for layouts/pages; `PascalCase` for components (e.g., `PlayerCard.tsx`).
- **Variables/Functions:** `camelCase` (e.g., `playerLoadMetrics`).

### Structure Patterns

**Project Organization:**
- **Feature-Based:** Colocate related components, hooks, and actions inside `src/app/(features)/[feature-name]/`.
- **Global Components:** Generic UI elements live in `src/components/ui/` (shadcn).
- **Shared Libs:** Database config and common utilities live in `src/server/db/` and `src/lib/`.

**File Structure Patterns:**
- **Zod Schemas:** Define in `shared/schema.ts` to ensure frontend and backend share the same validation logic.
- **Agent Skills:** Defined in `_bmad/skills/[role]/skill-[name].md`.

### Format Patterns

**API Response Formats:**
- **Success:** Direct JSON objects for Route Handlers; Direct values for Server Actions.
- **Errors:** `{ message: string, code: string }` consistent structure.
- **Dates:** Always ISO 8601 strings in JSON; `Date` objects in TypeScript logic.

**Data Exchange Formats:**
- **JSON:** Default for all agent communication.
- **Form Data:** Only for heavy file ingestion (Analyst Agent workflows).

### Communication Patterns

**Event System Patterns:**
- **No Global Store:** Prefer **React Query** for server state and **Server Actions** for mutation state.
- **Inngest Events:** `[domain].[action]` (e.g., `rugby.match_data_ingested`).

### Process Patterns

**Error Handling Patterns:**
- **Server-Side:** Use `try/catch` in Actions and return a structured error object.
- **Client-Side:** Use **React Error Boundaries** for UI crashes and **Toast notifications** for Action failures.

**Loading State Patterns:**
- **Suspense:** Use `<Suspense>` with skeleton loaders for all heavy dashboard metrics.
- **Optimistic UI:** Implement for simple toggles (e.g., marking a wellness check as reviewed).

### Enforcement Guidelines

**All AI Agents MUST:**
- Use `use server` directive for all database mutations.
- Validate every input payload with a corresponding Zod schema.
- Reference `shared/schema.ts` as the single source of truth for entity definitions.

**Pattern Enforcement:**
- Run `npm run check` (TypeScript) and `npx drizzle-kit check` (Schema) before every implementation commit.
