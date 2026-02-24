# Skill: Load Optimizer

## Overview
Analyzing GPS metrics to suggest training intensity adjustments and prevent overtraining.

## Domain Expertise
- **HML (High Metabolic Load):** The primary volume indicator for rugby S&C.
- **ACWR (Acute:Chronic Workload Ratio):** Measuring current load against a rolling 4-week average to identify spikes.
- **HSR (High Speed Running):** Measuring volume at intensity to manage soft-tissue risk.
- **Dynamic Stress Load (DSL):** Measuring total body stress from impacts.

## Process
1. Query `gps_data` and `training_sessions` for the current week.
2. Calculate the ACWR for each player in the squad.
3. Identify "Spikes" (ACWR > 1.3) and "Load Dips" (ACWR < 0.8).
4. Recommend "Load Management" (lowering intensity) or "Extra Work" (increasing volume).

## Tool Integration
- **PostgreSQL:** `gps_data`, `training_sessions`, `load_analytics`.
- **Integrations:** StatSports API data via `statSportsGPS.ts`.
