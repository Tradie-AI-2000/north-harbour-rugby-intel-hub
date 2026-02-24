# Architecture Validation & Completion - Implementation Plan

## Overview
This plan addresses the gaps between the current Vite/Express/Firebase "brownfield" state and the target "North Harbour Rugby Intel Hub" architecture (Next.js 15+, PostgreSQL/Drizzle, Multi-Agent Sidecar). It focuses on completing the relational schema for HeadGuard Pro, defining missing AI agents/skills, and unifying the ingestion strategy.

## Scope Definition (CRITICAL)
### In Scope
- Implementing missing HeadGuard Pro `pgTable` definitions in `shared/schema.ts`.
- Creating the `_bmad/skills/` directory and populating it with specialized role-specific skills.
- Defining missing "Coach", "Medical", and "Trainer" agents in `_bmad/bmm/agents/`.
- Proposing a unified ingestion service architecture to replace in-memory XML storage.
### Out of Scope (DO NOT TOUCH)
- Implementing the actual Next.js 15+ framework upgrade (this is a separate implementation ticket).
- Removing legacy Firebase/Replit code (this is a separate refactoring ticket).

## Current State Analysis
- **Schema:** Zod schemas exist for HeadGuard Pro but `pgTable` definitions are missing.
- **Agents:** Analyst, Dev, QA, etc. exist, but Coach, Medical, and Trainer are missing.
- **Ingestion:** XML data is stored in-memory (`Map<string, XMLMatchData>`).
- **Dependencies:** `firebase` and `@replit` plugins still present in `package.json`.

## Implementation Phases

### Phase 1: Relational Schema Completion (HeadGuard Pro)
- **Goal**: Ensure the concussion management system has its own relational persistence.
- **Steps**:
  1. [ ] Create `head_injury_incidents` table in `shared/schema.ts`.
  2. [ ] Create `concussion_assessments` table in `shared/schema.ts`.
  3. [ ] Create `rtp_protocols` table in `shared/schema.ts`.
  4. [ ] Define relationships between `players` and these new tables.
- **Verification**: `npx drizzle-kit check` to ensure schema validity.

### Phase 2: Agentic Layer Expansion
- **Goal**: Implement the role-specific AI sidecar architecture defined in the PRD.
- **Steps**:
  1. [ ] Create `_bmad/bmm/agents/coach.md`, `_bmad/bmm/agents/medical.md`, `_bmad/bmm/agents/trainer.md`.
  2. [ ] Create `_bmad/skills/coach/`, `_bmad/skills/medical/`, `_bmad/skills/trainer/`, `_bmad/skills/analyst/` directories.
  3. [ ] Define `skill-cohesion-analyst.md`, `skill-squad-selector.md`, `skill-tactical-querier.md`, `skill-readiness-monitor.md` for Coach.
  4. [ ] Define `skill-rtp-validator.md`, `skill-injury-forecaster.md` for Medical.
  5. [ ] Define `skill-load-optimizer.md`, `skill-fitness-benchmarker.md` for Trainer.
  6. [ ] Define `skill-etl-orchestrator.md`, `skill-data-migrator.md`, `skill-integrity-validator.md` for Analyst.
- **Verification**: Verify files exist and match the PRD descriptions.

### Phase 3: Ingestion Service Unification
- **Goal**: Transition from in-memory to PostgreSQL persistence for match data.
- **Steps**:
  1. [ ] Draft a proposed `UnifiedIngestionService` architecture.
  2. [ ] Map `XMLMatchData` structure to `match_performances` and `match_summaries` tables.
  3. [ ] Design a `DataMigration` strategy to move legacy CSV/XML data into PostgreSQL.
- **Verification**: Architectural review of the proposed design.

### Phase 4: Modernization Audit
- **Goal**: Prepare for the Next.js and T3 Stack transition.
- **Steps**:
  1. [ ] Conduct a full dependency audit of `package.json`.
  2. [ ] List all Firebase/Replit-specific files that need removal or replacement.
  3. [ ] Validate the `architecture.md` "selected starter" (T3 Stack) against the current project size.
- **Verification**: A detailed "Modernization Audit Report" artifact.

## Finalize
- Move ticket status to 'Plan in Review'.
