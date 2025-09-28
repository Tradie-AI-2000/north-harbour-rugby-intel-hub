North Harbour Rugby Performance Hub
Overview
The North Harbour Rugby Performance Hub is a digital platform designed to enhance rugby performance management through data-driven analytics and AI-powered insights. It centralizes player development tracking, injury prevention, GPS performance analysis, and team cohesion analytics. The platform supports various user roles, including coaches, medical staff, and managers, providing specific permissions and access levels. It integrates modern web technologies with external services like StatSports GPS, Google Gemini AI, and Google Sheets to offer comprehensive rugby analytics.

The platform now features HeadGuard Pro, a complete Head Injury Management system that provides medical staff with comprehensive concussion management tools, RTP (Return to Play) protocol tracking, and detailed incident logging capabilities.

Recent Changes
September 2025 - HeadGuard Pro Head Injury Management System
Complete Head Injury Management System: Fully implemented HeadGuard Pro with comprehensive concussion management
RTP Protocol Manager: 6-stage Return to Play progression with automatic time tracking and validation
Incident Logging: Complete incident reporting with Mechanism of Injury (MOI), symptoms, and immediate actions
Assessment Tools: HIA, SCAT-6, BESS, and Daily Symptoms assessment components
Medical Hub Integration: Head Injury Summary with RTP status board and high-risk alerts
Player Profile Integration: Individual head injury management tabs in medical player profiles
Firebase Optimization: Resolved indexing issues for reliable medical data API performance
User Preferences
Preferred communication style: Simple, everyday language.

System Architecture
Frontend
Framework: React 18 (TypeScript, Vite)
Routing: Wouter
State Management: TanStack React Query
UI Components: shadcn/ui (Radix UI)
Styling: TailwindCSS
Form Handling: React Hook Form (Zod validation)
Backend
Runtime: Node.js (Express.js)
Language: TypeScript
Database ORM: Drizzle ORM
Build System: ESBuild
Development: TSX
Database
Primary Database: PostgreSQL (Neon serverless)
Schema Management: Drizzle migrations
Connection: @neondatabase/serverless for pooling
Time-series Data: JSON fields
Key Features
Player Management: Comprehensive profiles, time-series tracking, skills assessment, injury tracking.
HeadGuard Pro Head Injury Management: Complete concussion management system with 6-stage RTP protocol, incident logging, assessment tools (HIA, SCAT-6, BESS, Daily Symptoms), and medical hub integration.
AI Analytics: Google Gemini AI for performance analysis, injury risk prediction, tactical recommendations.
GPS Tracking: StatSports API integration for real-time movement analytics, player load, heart rate zones.
Role-Based Access Control: Hierarchical permissions for various user roles.
Medical & Injury Management: Comprehensive injury tracking, appointment scheduling, recovery timelines, alerts, and specialized head injury protocols.
Data Flow
Input Sources: Manual entry, CSV upload, GPS API, Google Sheets, AI Analysis.
Processing: Validation (Zod), integrity management, time-series aggregation, AI enhancement.
Relationships: Players are central, linked to physical attributes, game stats, injury records, and GPS data.
External Dependencies
Core Infrastructure
Neon PostgreSQL: Serverless database.
Vercel/Replit: Hosting and deployment.
Google Cloud: AI services, authentication.
AI and Analytics
Google Gemini AI: Rugby performance analysis.
OpenAI GPT-4: Alternative AI analysis.
StatSports API: Professional GPS tracking data.
Third-party Services
Google Sheets API: Data integration and reporting.
SendGrid: Email notifications.
Slack API: Team communication.
Development Tools
Drizzle Kit: Database migration.
ESBuild: Fast TypeScript compilation.
Vite: Development server.
