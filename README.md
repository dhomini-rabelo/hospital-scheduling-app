# Hospital Staff Scheduling App

A monorepo application to manage hospital staff, define staffing rules, generate weekly schedules, and operate all major actions through an AI chat flow with explicit user approval before execution.

## Table of Contents

- [Project Overview](#project-overview)
- [Documentation Links](#documentation-links)
- [Getting Started](#getting-started)
- [How the Project Works](#how-the-project-works)
- [Pages](#pages)
- [Architecture](#architecture)
- [Data Model Snapshot](#data-model-snapshot)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Project Overview

This project helps a hospital administrator:

- Maintain the team roster (profession and specialty).
- Define staffing requirements by date reference (for example: weekday, weekend, monday).
- Create and inspect day-level schedule entries.
- Auto-fill a week and handle swaps/gap-fill when changes happen.
- Use AI chat from any page to propose actions, review tool inputs, and approve or reject each action.

Main folders:

- [backend](backend)
- [frontend](frontend)
- [plan](plan)

## Documentation Links

Core specification:

- [PRD](plan/PRD.md)

Implementation plan by domain:

- Backend:
  - [US-001](plan/backend/US-001.md)
  - [US-002](plan/backend/US-002.md)
  - [US-003](plan/backend/US-003.md)
  - [US-004](plan/backend/US-004.md)
  - [US-005](plan/backend/US-005.md)
- Frontend:
  - [US-001](plan/frontend/US-001.md)
  - [US-002](plan/frontend/US-002.md)
  - [US-003](plan/frontend/US-003.md)
  - [US-004](plan/frontend/US-004.MD)
  - [US-005](plan/frontend/US-005.md)
- Fullstack:
  - [US-006 (AI Chat)](plan/fullstack/US-006.MD)

Existing frontend template README:

- [frontend/README.md](frontend/README.md)

## Getting Started

### Prerequisites

- Node.js 20+
- npm 8+

### 1) Clone the repository

```bash
git clone <your_repository_url>
```

### 2) Change into the project directory

```bash
cd hospital-scheduling-app
```

### 3) Install dependencies

From repository root:

```bash
npm i
```

### 4) Configure environment variables (Optional)

The backend loads env files based on `NODE_ENV`:

- `development` -> `backend/.env.development`
- `test` -> `backend/.env.test`
- otherwise -> `backend/.env`

Create or update [backend/.env.development](backend/.env.development) with local values:

```env
API_PORT=5000
DATABASE_URL="file:./dev.db"
GOOGLE_GENERATIVE_AI_API_KEY="your_google_generative_ai_api_key"
```

Optional test env in [backend/.env.test](backend/.env.test):

```env
API_PORT=5000
DATABASE_URL="file:./test.db"
GOOGLE_GENERATIVE_AI_API_KEY="your_google_generative_ai_api_key"
```

### 5) Setup database (Prisma + SQLite)

From repository root:

```bash
npm run backend:prisma:migrate
```

`prisma migrate dev` already triggers Prisma Client generation, so running `generate` is not required in the normal setup flow.

If you only changed schema/types and do not want to run a migration, you can regenerate the client explicitly:

```bash
npm run backend:prisma:generate
```

### 6) Seed the database (Optional)

From repository root:

```bash
npm run backend:seed:fake-data
```

What this seed command does:

- Clears current data from team members, schedule requirements, and schedule entries tables.
- Creates 32 team members distributed across all professions:
  - Doctors: Emergency, Cardiology, Pediatrics
  - Nurses: ICU, Emergency, General Ward, Pediatric
  - Technicians: Lab, Radiology
  - Support Staff: Receptionist, Security, Cleaning
- Creates 2 enabled schedule requirements:
  - `weekday` requirement set
  - `weekend` requirement set
- Creates 14 schedule entries (2 weeks, Monday to Sunday), each linked to the corresponding weekday/weekend requirement and prefilled with a structure matching that day type.

### 7) Run both apps with Turborepo (recommended)

From repository root:

```bash
npm run dev
```

This starts backend and frontend in parallel.

### 8) Run apps separately (Optional)

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## How the Project Works

1. The admin manages team members with profession and specialty constraints.
2. The admin defines active schedule requirements by date reference and required counts (including specialty sub-requirements).
3. The admin can create/set schedule entries for dates in the allowed window.
4. The system computes per-day overview, showing fulfilled requirements and gaps.
5. Auto-fill generates assignments from eligible members and clears/rebuilds target week entries.
6. Swap and gap-fill flows replace unavailable members while preserving rule compatibility.
7. AI chat accepts natural language commands, proposes tool actions, and waits for explicit approval/rejection before executing API operations.
8. After approved tool execution, frontend data is refreshed so UI reflects new backend state.

## Pages

Routes are defined in [frontend/src/layout/router/routes.ts](frontend/src/layout/router/routes.ts).

- `/` -> Schedule (default)
  - Purpose: mini calendar, day overview, set schedule, auto-fill.
  - Contextual AI entry: "Schedule with AI".
- `/schedule-requirements` -> Schedule Requirements
  - Purpose: create, list, edit, enable/disable staffing rules.
  - Contextual AI entry: "Configure with AI".
- `/team-members` -> Team Members
  - Purpose: create, list, update, delete staff roster.
  - Contextual AI entry: "Manage with AI".

Sidebar navigation is in [frontend/src/layout/components/Sidebar.tsx](frontend/src/layout/components/Sidebar.tsx).

## Architecture

### Monorepo

- Root workspace manages apps with npm workspaces and Turborepo.
- [backend](backend): Express + Prisma + SQLite + domain-driven use-cases.
- [frontend](frontend): React + Vite + Tailwind + React Query + Jotai.

### Backend architecture

Source root: [backend/src](backend/src)

- `domain/`
  - `entities/`: business entities.
  - `use-cases/`: application rules and orchestration.
  - `utils/`: domain helper logic.
- `adapters/`
  - Repository abstractions used by domain use-cases.
- `infra/`
  - `adapters/repository/`: Prisma implementations.
  - `http/routes/`: request validation and use-case wiring.
  - `services/`: env and Prisma client.
- `modules/domain/`
  - Base abstractions (entity, value-object, use-case, errors, watched-list).

Key API registration is in [backend/src/infra/http/app.ts](backend/src/infra/http/app.ts).

### Frontend architecture

Source root: [frontend/src](frontend/src)

- `core/`: app bootstrap and API client.
- `layout/`
  - `components/layouts/AppLayout.tsx`: persistent shell + chat widget.
  - `components/Sidebar.tsx`: left navigation.
  - `components/chat/`: chat UI and tool approval rendering.
  - `router/`: route definitions.
  - `states/`: chat atoms.
- `pages/`
  - Page folders with page-local components/hooks/state.
- `server/`
  - API route constants, API calls, and data types.

## Data Model Snapshot

Primary entities (SQLite via Prisma):

- TeamMember: `name`, `profession`, `specialty`, status metadata.
- ScheduleRequirement: `dateReference`, requirements payload, `isEnabled`.
- ScheduleEntry: date-level assignment structure for a single day.

Relationships:

- A schedule entry references many team members.
- A schedule entry can reference schedule requirements used for that plan.
- Requirement satisfaction is evaluated by profession totals and specialty sub-counts.

Schema source: [backend/prisma/schema.prisma](backend/prisma/schema.prisma).

## Testing

### Lint and type-check

Backend:

```bash
cd backend
npm run lint:fix
npx tsc --noEmit
```

Frontend:

```bash
cd frontend
npm run lint:fix
npm run check-types
```

### Backend endpoint scenario scripts

With backend running, execute:

```bash
cd backend/tests
bash team-member.bash
bash schedule-requirement.bash
bash schedule-entry.bash
```

## Troubleshooting

- Backend fails to start with env error:
  - Check required vars in [backend/src/infra/services/env.ts](backend/src/infra/services/env.ts).
  - Confirm `backend/.env.development` has all three values.
- Prisma migration issues:
  - Use the root scripts: `npm run backend:prisma:migrate` and `npm run backend:prisma:generate`.
  - If migration fails after schema changes, run `npm run backend:prisma:generate` and retry `npm run backend:prisma:migrate`.
- Frontend cannot reach backend:
  - Ensure backend is running on port `5000`.
  - API base URL is currently hardcoded in [frontend/src/core/api-client.ts](frontend/src/core/api-client.ts).
- Chat does not respond:
  - Verify `GOOGLE_GENERATIVE_AI_API_KEY` is valid.
  - Verify backend `/chat` route is healthy and backend is reachable from frontend.

---

If you want, a next improvement is adding a `.env.example` in `backend/` and switching frontend to `VITE_API_BASE_URL` for easier environment portability.
