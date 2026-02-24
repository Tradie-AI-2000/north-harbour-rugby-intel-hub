---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys']
inputDocuments:
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
  - 'docs/project-scan-report.json'
documentCounts:
  briefCount: 0
  researchCount: 1
  brainstormingCount: 0
  projectDocsCount: 10
classification:
  projectType: 'web_app'
  domain: 'High Performance Sport - RUGBY UNION'
  complexity: 'high'
  projectContext: 'brownfield'
workflowType: 'prd'
---

# Product Requirements Document - north-harbour-rugby-intel-hub

**Author:** Joeward
**Date:** 2026-02-25

## Executive Summary

The North Harbour Rugby Intel Hub is an elite-level performance intelligence platform designed to provide a "God-like" view over the entire rugby organization. By transitioning to a unified **Next.js 15+ App Router** architecture, the hub centralizes technical rugby analytics, GPS performance data, medical status, and mental readiness into a single authoritative command center. The platform is anchored by a sophisticated **Agentic Intelligence Layer**, providing role-specific AI agents that assist the Head Coach, analysts, and medical staff with specialized tasks, data querying, and strategic simulations. This modernization empowers senior management with total organizational oversight through high-integrity **PostgreSQL (Neon)** data unified by intelligent automation.

### What Makes This Special

The hub's unique value lies in its **Agent-Driven Intelligence Architecture**. Unlike static dashboards, this platform pairs every key role with a dedicated AI Agent equipped with specialized `skills.md` definitions. This allows rugby analysts to automate complex XML/GPS ingestion via their agent, while the Head Coach's agent provides proactive tactical recommendations and "mental side" trend alerts. This unified ecosystem ensures that the "God-like" view is not just visible, but interpreted and actionable through the lens of elite rugby expertise.

## Project Classification

- **Project Type:** Web Application (Next.js App Router / PWA)
- **Domain:** High Performance Sport - RUGBY UNION
- **Complexity:** High (Organizational oversight, complex data ingestion, AI-driven strategy)
- **Project Context:** Brownfield (Modernizing from Vite/Express/Firebase/Replit)

## Success Criteria

### User Success

- **Total Oversight:** The Head Coach and senior management can view the real-time "Readiness & Performance Status" of the entire organization on a single screen.
- **Analyst Efficiency:** Rugby analysts can ingest and migrate raw match XML and GPS data into the production database in < 5 minutes post-session.
- **Mental Clarity:** Clear visualization of player "mental side" performance markers alongside physical and technical stats.
- **Safety Assurance:** Automated RTP validation remains a core safeguard within the broader performance dashboard.

### Business Success

- **Unified Intelligence:** 100% of data sources (Match XML, GPS, Wellness, Mental, Medical) consolidated into the PostgreSQL hub.
- **Strategic Lead Time:** Reduction in time from "data collection" to "tactical decision" by 70%.
- **Operational Integrity:** Successful migration of legacy datasets into the new relational structure without data loss.

### Technical Success

- **High-Throughput Ingestion:** Robust API Route Handlers capable of processing and validating multi-megabyte XML/CSV datasets without timeouts.
- **Relational Integrity:** A normalized Drizzle schema that correctly links match-day analytics to specific player performance and organizational trends.
- **Performance:** Sub-second latency for "top-down" organizational overview dashboards using React Server Components.

### Measurable Outcomes

- **The "Single Screen" Standard:** 100% of coaching decisions can be made using data visible within the Hub.
- **Analyst Throughput:** Successfully processing 100% of 2025-2026 season data through the new ingestion engine.
- **Mental Ingestion:** First-time systemic tracking of psychological performance markers for all contracted players.

## Product Scope

### MVP - Minimum Viable Product

- **Multi-Agent Orchestration Layer:** Specialized AI agents for each user role, governed by `skills.md` definitions for task-specific intelligence.
    - **Coach Agent:** Skill-based querying for tactical insights and squad status.
    - **Analyst Agent:** Automated ingestion, migration, and validation of Match XML and GPS CSV data.
- **Rugby Analytics Ingestion Engine:** High-integrity Route Handlers for data migration into PostgreSQL.
- **The "God-Like" Dashboard:** Top-down organizational overview for senior management.
- **Mental Performance Tracking:** Systemic capture of psychological markers.
- **HeadGuard Pro Port:** Integrated concussion management and RTP interlocks.

### Growth Features (Post-MVP)

- **Medical & Trainer Agents:** Specialized agents for injury risk modelling and periodization planning.
- **Predictive Tactical Modeling:** Advanced AI simulations of opponent game-play.
- **Natural Language Data Ingestion:** Allowing analysts to "describe" technical events to their agent for instant database entry.

### Vision (Future)

- **Live In-Game Intelligence:** Real-time data migration and visualization during live matches.
- **Multi-Tenant Federation:** A standardized intelligence hub platform for regional and national rugby unions.

## AI Agent Architecture

The Hub utilizes a **Multi-Agent Sidecar Model**, where each specialized user role is assisted by a dedicated AI Agent. These agents are governed by a collection of `skills.md` files that define their capabilities, data access levels, and specific rugby domain expertise.

### 1. The Coach Agent
- **Primary Goal:** Strategic decision support and squad optimization.
- **Specialized Skills:**
    - `skill-cohesion-analyst.md`: Calculating and Analyzing Team Cohesion (TWI) to identify high-synergy player combinations.
    - `skill-squad-selector.md`: Analyzing technical, mental, and cohesion data to suggest the best starting XV.
    - `skill-tactical-querier.md`: Natural language querying of historical match performance.
    - `skill-readiness-monitor.md`: Proactive alerting on squad-wide fatigue and mental "dips."

### 2. The Analyst Agent
- **Primary Goal:** High-throughput data ingestion and migration integrity.
- **Specialized Skills:**
    - `skill-etl-orchestrator.md`: Automating the parsing and relational mapping of XML/CSV data.
    - `skill-data-migrator.md`: Ensuring legacy Firebase data matches the new PostgreSQL schema.
    - `skill-integrity-validator.md`: Running checksums and validation scripts on technical performance tables.

### 3. The Medical Agent
- **Primary Goal:** Concussion management and patient safety oversight.
- **Specialized Skills:**
    - `skill-rtp-validator.md`: Automating the 6-stage clinical validation for HeadGuard Pro.
    - `skill-injury-forecaster.md`: Modelling injury risk based on training load spikes.

### 4. The Trainer Agent
- **Primary Goal:** Physical performance and periodization planning.
- **Specialized Skills:**
    - `skill-load-optimizer.md`: Analyzing GPS metrics to suggest training intensity adjustments.
    - `skill-fitness-benchmarker.md`: Comparing current results against positional standards.

## User Journeys

### Journey 1: The Agent-Assisted Ingestion
**Persona:** Mark (Rugby Analyst)
**Story:** Mark uploads a complex XML file from Saturday’s game. Instead of manual mapping, he triggers his **Analyst Agent**. Using its `skill-etl-orchestrator`, the agent parses the technical tables, identifies three player ID mismatches, and suggests the correct mappings. Mark approves the fix, and the agent migrates the data into **PostgreSQL**. The agent then generates a "Data Integrity Report," confirming that 100% of tackles and carries are correctly attributed, saving Mark hours of manual auditing.

### Journey 2: The Strategic Dialogue & Cohesion Analysis
**Persona:** Mike (Head Coach)
**Story:** Mike logs into the **Organizational Command Center** and triggers his **Coach Agent**. He asks, "Analyze our current midfield cohesion. How does the TWI (Team Work Index) shift if we start our rookie 12 next to our veteran 13?" The agent utilizes `skill-cohesion-analyst.md` to cross-reference historical match involvements and training synergies. It reports that while the technical individual metrics are high, the TWI drops by 15% compared to the usual pairing, but highlights that their "mental side" resilience markers are perfectly matched for a high-pressure defensive game. Mike uses this "God-like" oversight to make a balanced tactical choice, prioritizing cohesion for the upcoming finals match.

### Journey 3: The Automated Protocol
**Persona:** Dr. Sarah Wilson (Head Medical Officer)
**Story:** Dr. Wilson logs a concussion incident for a player. Her **Medical Agent** immediately initializes the HeadGuard Pro protocol. As the player submits wellness data, the agent uses `skill-rtp-validator` to check if the 24-hour symptom-free threshold has been met before allowing any physical activity logging. When the player is ready for Stage 4, the agent sends a concise briefing to Dr. Wilson, summarizing the recovery markers and requesting her clinical signature for advancement.

### Journey Requirements Summary

- **Agentic Orchestration Layer:** Infrastructure to support multiple role-specific AI sidecars.
- **Skill-Based Tooling:** Implementation of `skills.md` files to govern agent logic and domain expertise.
- **Natural Language Query Interface:** Allowing coaches to interact with complex PostgreSQL data via conversational AI.
- **Automated Data Validation:** Agent-led integrity checks for all incoming XML/GPS datasets.
- **Unified Health & Tactical Interlocks:** Ensuring medical agent flags propagate instantly to the coach agent's strategic recommendations.

---

<!-- Content will be appended sequentially through research workflow steps -->
