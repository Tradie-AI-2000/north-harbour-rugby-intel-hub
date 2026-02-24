# Architecture - Frontend Client

## Overview
The frontend is a React 18 single-page application (SPA) built with TypeScript and Vite. It is currently configured for deployment on Replit/Vercel and uses a combination of local state, React Query for server state, and Wouter for routing.

## Technology Stack
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** Wouter
- **State Management:** TanStack React Query (v5)
- **UI Components:** Radix UI, Lucide Icons, shadcn/ui
- **Styling:** Tailwind CSS (v3/v4), Framer Motion
- **Data Fetching:** Axios/Fetch (via custom `apiRequest` utility)
- **Validation:** Zod

## Component Architecture
The application follows a component-based architecture with a clear separation between pages and reusable UI elements.

- `client/src/pages/`: Contains the top-level view components mapped to routes.
- `client/src/components/`: Reusable UI components (buttons, cards, dialogs, etc.).
- `client/src/hooks/`: Custom React hooks for shared logic (e.g., `useWebSocket`, `use-ai-analysis`).
- `client/src/lib/`: Library configurations and utility functions.

## Data Flow
1.  **Request:** Components use `useQuery` or `useMutation` from TanStack Query to initiate requests.
2.  **API Client:** The `apiRequest` utility handles the actual HTTP calls to the backend.
3.  **Response:** Data is validated using Zod schemas before being used in the UI.
4.  **State Update:** React Query caches the response and triggers a re-render.

## Integration Points
- **Backend API:** Connects to the Express server on the same host (currently port 5000).
- **Firebase API:** Numerous pages directly call `/api/firebase/*` endpoints for specialized data.
- **WebSockets:** Attempts to connect to `/ws` for real-time updates (currently unconfirmed on server).

## Modernization Strategy (Next.js Transition)
- Move `client/src/pages/` to `app/` directory (Next.js App Router).
- Replace `wouter` with Next.js `Link` and `useRouter`.
- Port client-side libraries and components to be compatible with Server Components where possible.
- Purge all Firebase-specific UI components and hooks.
