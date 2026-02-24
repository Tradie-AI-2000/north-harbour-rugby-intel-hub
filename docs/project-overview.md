# Project Overview - North Harbour Rugby Intel Hub

## Purpose
The North Harbour Rugby Intel Hub is a centralized performance management platform for North Harbour Rugby. It leverages AI and data analytics to optimize player development, injury prevention (via HeadGuard Pro), and team strategy.

## Core Features
- **Player Development Tracking:** Comprehensive profiles with skills, physical attributes, and performance history.
- **HeadGuard Pro:** A specialized concussion management system with 6-stage Return to Play (RTP) protocols.
- **Performance Analytics:** Integration with StatSports GPS for movement analytics and load management.
- **AI-Powered Insights:** Utilizes Google Gemini, Anthropic, and OpenAI for injury risk prediction and tactical analysis.
- **Data Ingestion:** Supports CSV, XML (match data), and PDF (match reports) uploads.

## Technology Stack Summary
| Category | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Wouter, Radix UI, Tailwind CSS |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL (Neon), Drizzle ORM |
| **AI** | Google Gemini (Primary), Anthropic, OpenAI |
| **Integration** | StatSports, Google Sheets, Slack, SendGrid |

## Project Maturity
This is a **Brownfield** project currently undergoing a major architectural modernization.

**Modernization Goals:**
1.  **Framework Upgrade:** Transition from React/Express/Vite to Next.js App Router.
2.  **Database Consolidation:** Purge all Firebase Firestore usage and unify all data in PostgreSQL.
3.  **Infrastructure Purge:** Remove all Replit-specific plugins, scripts, and configurations.

## Repository Structure
- **client/**: Frontend SPA (Target: `app/` directory).
- **server/**: Express API (Target: `app/api/` routes).
- **shared/**: Common types and Drizzle schemas.
- **docs/**: Project documentation (this folder).
- **_bmad/**: BMad Core AI orchestration config.

## Next Steps
- Port existing React pages to Next.js App Router.
- Migrate Firebase schemas to PostgreSQL via Drizzle.
- Implement Next.js API Routes to replace Express handlers.
- Conduct a full dependency audit to remove `firebase` and `replit` packages.
