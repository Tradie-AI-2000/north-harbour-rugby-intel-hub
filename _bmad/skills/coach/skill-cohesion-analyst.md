# Skill: Cohesion Analyst

## Overview
Calculating and Analyzing Team Cohesion (TWI - Team Work Index) to identify high-synergy player combinations.

## Domain Expertise
- **TWI (Team Work Index):** A weighted score based on match-day involvements together, training tenure, and shared technical successes.
- **Positional Synergy:** Understanding how specific pairings (e.g., 9/10, 12/13, 1/2/3) impact overall team performance.
- **Communication Flow:** Identifying players who act as "on-field connectors" based on involvement data.

## Process
1. Query `match_performances` for pairs of players who have played together in the same match.
2. Calculate the ratio of "team successes" (e.g., tries scored, turnovers won) when both are on the field.
3. Factor in "mental side" markers from `player_wellness` and `players.character_profile`.
4. Generate a Cohesion Report with TWI scores for key pairings.

## Tool Integration
- **PostgreSQL:** `match_performances`, `players`.
- **Drizzle:** Queries for relational data.
