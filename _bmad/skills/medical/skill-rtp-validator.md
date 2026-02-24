# Skill: RTP Validator

## Overview
Automating the 6-stage clinical validation for HeadGuard Pro RTP (Return to Play) protocols.

## Domain Expertise
- **Stage Progression:** Ensuring 24-hour symptom-free gaps between stages.
- **Symptom Thresholds:** Validating `daily_symptoms` from `concussion_assessments`.
- **Clinical Signatures:** Handling HIA and SCAT6 compliance.
- **Interlocks:** Preventing physical activity logging if Stage 1 or 2 are active.

## Process
1. Query `rtp_protocols` for the current stage.
2. Check `concussion_assessments` (daily symptoms) for the last 24-48 hours.
3. Verify if `symptom_free_required` is met for the current stage.
4. Auto-progress or block advancement based on logic.
5. Notify the Head Medical Officer for final clinical signature on Stage 6.

## Tool Integration
- **PostgreSQL:** `rtp_protocols`, `concussion_assessments`, `head_injury_incidents`.
- **Validation:** Zod-based schema compliance.
