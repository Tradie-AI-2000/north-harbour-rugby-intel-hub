# Data Models - North Harbour Rugby Intel Hub

## Overview
The project currently manages data using a split architecture: **PostgreSQL (via Drizzle ORM)** for structured rugby and operational data, and **Firebase Firestore** for medical, performance, and legacy analytics data.

## Core Database (PostgreSQL - Drizzle)

### Users Table
- `id`: primary key
- `username`: unique string
- `email`: unique string
- `hashedPassword`: string
- `role`: enum (coach, medical, admin, etc.)
- `permissions`: string array

### Players Table
- `id`: primary key (string)
- `personalDetails`: jsonb (Name, DOB, Email, Emergency Contact)
- `rugbyProfile`: jsonb (Jersey, Position, Level, Clubs)
- `physicalAttributes`: jsonb (Weight, Body Fat, Lean Mass history)
- `testResults`: jsonb (S&C test history)
- `skills`: jsonb (Ball Handling, Passing, Defense, etc.)
- `injuries`: jsonb (History of injury records)
- `status`: jsonb (Fitness and Medical availability)
- `aiRating`: jsonb (Overall, Physicality, Skillset, Potential)

### Performance & Tracking Tables
- **Match Performances**: Detailed stats per player per match (Attacking, Defensive, Infringements).
- **Match Summaries**: Team-level statistics for each match.
- **GPS Data**: High-resolution movement metrics (Distance, Speed, HML, Accelerations).
- **Player Wellness**: Daily self-reported metrics (Sleep, Soreness, Fatigue, Stress).
- **Injury Risk Flags**: AI/System generated alerts based on load spikes or wellness drops.
- **Training Workrate Sessions**: Aggregated session-level GPS summaries.

## Legacy Models (Firebase Firestore - Target for Migration)

The following entities exist in the Firebase schema and must be fully integrated into the PostgreSQL `players` table or new related tables:

### Medical Management
- **Medical Appointments**: `id`, `type`, `provider`, `date`, `time`, `status`.
- **Medical Notes**: `id`, `title`, `content`, `author`, `urgency`, `isConfidential`.
- **Rehab Programs**: `phase`, `exercises`, `progressCriteria`.

### Coaching & Analysis
- **Coaching Notes**: `type`, `category`, `priority`, `actionItems`, `tags`.
- **Match Analysis**: `ratings`, `positiveContributions`, `negativeContributions`.
- **AI Analysis**: `prompt`, `insights`, `confidenceScores`, `injuryRiskAssessment`.

## Migration Mapping Strategy

| Firebase Entity | PostgreSQL Target | Migration Status |
| :--- | :--- | :--- |
| `players` collection | `players` table | Partially migrated |
| `medicalAppointments` | `medical_appointments` table (New) | Pending |
| `medicalNotes` | `medical_notes` table (New) | Pending |
| `gpsSessions` | `gps_data` table | Migrated |
| `fitnessTests` | `test_results` field in `players` | Migrated |
| `coachingNotes` | `coaching_notes` table (New) | Pending |
| `aiAnalysis` | `ai_analysis` table (New) | Pending |

## Validation Logic
All data models are governed by **Zod** schemas in `shared/schema.ts`, ensuring consistency between the TypeScript code and the database.
