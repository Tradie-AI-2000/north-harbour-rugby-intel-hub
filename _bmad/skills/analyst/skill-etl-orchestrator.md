# Skill: ETL Orchestrator

## Overview
Automating the parsing, validation, and relational mapping of raw XML/CSV match and GPS data.

## Domain Expertise
- **Schema Mapping:** Translating Opta/XML events to `match_performances` tables.
- **Entity Resolution:** Matching "Player Names" from raw files to `player_id` in PostgreSQL.
- **Checksums:** Verifying that total tries/tackles in the XML match the database sum.
- **Error Handling:** Identifying and proposing fixes for data mismatches.

## Process
1. Receive raw file (XML/CSV) from Route Handler.
2. Trigger `XMLMatchProcessor` or `csv-parser`.
3. Resolve Player IDs via `players` lookup.
4. Preview data and request human approval for "Ambiguous Mappings".
5. Persist to PostgreSQL via Drizzle.
6. Generate an "Ingestion Integrity Report".

## Tool Integration
- **PostgreSQL:** `match_performances`, `match_summaries`, `players`.
- **Logic:** `xml-processor.ts`, `csv-parser.ts`.
- **Validation:** `shared/schema.ts`.
