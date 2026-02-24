# Ingestion Service Unification - Architecture Proposal

## 1. Executive Summary
The North Harbour Rugby Intel Hub currently stores processed XML match data in-memory within the `xml-upload-api.ts` route. This is non-persistent and limits cross-agent collaboration (e.g., Coach Agent cannot query data uploaded by Analyst Agent). This proposal unifies the ingestion flow into a **Relational Persistence Layer** using PostgreSQL and Drizzle.

## 2. Current Architecture (Fragmented)
- **XML Ingestion:** Express Route -> `XMLMatchProcessor` -> In-memory `Map`.
- **GPS Ingestion:** Fragmented CSV parsing logic in `statSportsGPS.ts`.
- **Legacy Migration:** Manual scripts in `server/firebase-migration.ts`.

## 3. Proposed Architecture (Unified)

### 3.1. Unified Ingestion Flow
1. **Source Data Arrival:** API Route (`/api/ingestion/match-data`) receives XML/CSV.
2. **Role-Based Validation:** The **Analyst Agent** triggers the `skill-etl-orchestrator.md`.
3. **Relational Mapping:** 
   - Team metrics are mapped to the `match_summaries` table.
   - Individual player events are mapped to the `match_performances` table.
   - GPS movement data is mapped to the `gps_data` table.
4. **PostgreSQL Persistence:** Use Drizzle `db.insert().onConflictUpdate()` to ensure data integrity and avoid duplicates.
5. **Event Propagation:** Trigger an **Inngest** event (or similar) to notify other agents (e.g., "Match Data Ready" -> Medical Agent checks for head injury markers).

### 3.2. Data Mapping Strategy
| XML/CSV Entity | PostgreSQL Table | Key Fields |
| :--- | :--- | :--- |
| `XMLMatchInfo` | `match_summaries` | `opponent`, `date`, `result` |
| `XMLTeamStats` | `match_summaries` | `team_possession`, `team_territory`, `team_tries` |
| `XMLPlayerPerformance` | `match_performances` | `player_id`, `carries`, `tackles_made`, `metres_gained` |
| `StatSportsRow` | `gps_data` | `player_id`, `total_distance`, `high_speed_running` |

## 4. Porting to Next.js
The proposed Unified Ingestion Service should be implemented as a stateless utility that can be called from:
- **Express Route Handlers** (Current "Brownfield" state).
- **Next.js API Route Handlers** (Modernization target).
- **Inngest Background Jobs** (For multi-megabyte processing).

## 5. Next Steps
1. Refactor `server/xml-upload-api.ts` to use the `db` instance from `server/db.ts` for persistence.
2. Implement the `onConflictUpdate` logic to handle re-uploads of the same match data.
3. Migrate existing `matchDataStore` memory usage to SQL queries.
