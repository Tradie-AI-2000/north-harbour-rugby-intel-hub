# API Contracts - North Harbour Rugby Intel Hub

## Overview
The API is currently served by an Express server on port 5000. All endpoints are prefixed with `/api`.

## Core API Endpoints (PostgreSQL/Drizzle)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/players` | Retrieve all player profiles (currently uses Firebase fallback logic). |
| **GET** | `/api/players/:id` | Retrieve a single player profile. |
| **POST** | `/api/players` | Create a new player profile. |
| **PATCH** | `/api/players/:id` | Update an existing player profile. |
| **PUT** | `/api/medical/player/:id/availability` | Update player medical status and availability notes. |
| **GET** | `/api/v2/wellness/squad-readiness` | Get a summary of the squad's readiness/wellness scores. |
| **GET** | `/api/v2/wellness/player/:playerId` | Get wellness history for a specific player. |
| **POST** | `/api/v2/wellness/player/:playerId` | Submit a new wellness entry for a player. |
| **GET** | `/api/v2/testing/protocols` | List available S&C testing protocols (Back Squat, 20m Sprint, etc.). |
| **POST** | `/api/v2/testing/entries` | Submit a new physical testing result. |
| **GET** | `/api/ai/training-insights` | Generate AI-powered insights for a training session. |
| **POST** | `/api/upload/xml-match-data` | Upload and process XML-based rugby match data. |
| **GET** | `/api/download/statsports-template` | Download the StatSports GPS upload CSV template. |

## Firebase API Endpoints (To be Removed/Migrated)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/firebase/players` | Fetch players from Firestore collections. |
| **POST** | `/api/firebase/migrate` | Execute legacy data migration to Firebase. |
| **POST** | `/api/firebase/cleanup` | Cleanup redundant Firestore data. |
| **POST** | `/api/firebase/system-test` | Run tests against the Firebase integration. |
| **GET** | `/api/firebase/players/:id/medical/appointments` | Get appointments for a specific player. |
| **GET** | `/api/firebase/players/:id/medical/notes` | Get medical notes for a player. |
| **GET** | `/api/firebase/players/:id/medical/injuries` | Get injury history from Firestore. |

## Authentication
Authentication is currently handled via **Passport.js** and **express-session** on the server. The transition to Next.js will involve adopting **NextAuth.js** or a similar Next.js-native authentication solution.

## Data Validation
All API requests are validated using **Zod** schemas defined in `shared/schema.ts` and `shared/firebase-schema.ts`.
