# North Harbour Rugby Performance Hub - Documentation Index

## Project Summary
A digital performance management platform for North Harbour Rugby, integrating player development, injury prevention (HeadGuard Pro), GPS analytics (StatSports), and AI-driven insights (Gemini/Claude).

- **Current State:** Brownfield (Vite, React, Express, Firebase).
- **Modernization Target:** Next.js App Router, Unified PostgreSQL (Drizzle/Neon).

## Primary Documentation

### [Project Overview](./project-overview.md)
A high-level summary of the hub's purpose, features, and technology stack.

### [Architecture - Frontend Client](./architecture-client.md)
Details on the React 18 SPA, component structure, and Next.js migration strategy.

### [Architecture - Backend Server](./architecture-server.md)
Details on the Express API server, logic modules, and the plan to transition to Next.js API Routes.

### [Development Guide](./development-guide.md)
Prerequisites, installation steps, development workflows, and testing instructions.

### [Source Tree Analysis](./source-tree-analysis.md)
An annotated directory tree highlighting current modules and modernization targets.

### [API Contracts](./api-contracts.md)
A catalog of current core endpoints and legacy Firebase routes slated for removal.

### [Data Models](./data-models.md)
A comprehensive comparison of the existing PostgreSQL (Drizzle) and Firebase Firestore schemas.

### [Project Parts Metadata](./project-parts.json)
A machine-readable JSON file describing the project's multi-part structure and integration points.

## Integration & Operational Status
- **PostgreSQL Database:** Fully operational via Drizzle ORM.
- **Firebase Firestore:** Active for legacy data (Target for removal).
- **Replit Hosting:** Current platform (Target for removal).
- **AI Analytics:** Integrated with Google Gemini, Anthropic, and OpenAI.
- **StatSports GPS:** Integrated for data ingestion and performance analysis.

## Getting Started for AI Agents
When assisting with this project, please refer to the documents above to maintain context on the current architecture and the modernization roadmap. Priority should be given to identifying and refactoring Firebase and Replit-specific logic as the project transitions to Next.js.
