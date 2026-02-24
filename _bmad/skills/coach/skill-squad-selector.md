# Skill: Squad Selector

## Overview
Analyzing technical, mental, and cohesion data to suggest the best starting XV for an upcoming match.

## Domain Expertise
- **Readiness Score:** Derived from `player_wellness`.
- **Form Guide:** Weighted average of the last 3 matches' technical stats.
- **Injury Risk:** Integration with Medical Agent flags.
- **TWI Alignment:** Ensuring selected players have high synergy scores.

## Process
1. Filter `players` by `status.fitness === 'available'`.
2. Rank players by position based on technical form and readiness.
3. Suggest the Starting XV and Bench (23-man squad).
4. Highlight "High Cohesion" pairings and "Risk" selections.

## Tool Integration
- **PostgreSQL:** `players`, `match_performances`, `player_wellness`.
- **Logic:** `skill-cohesion-analyst.md` integration.
