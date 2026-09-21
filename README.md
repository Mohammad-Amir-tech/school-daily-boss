# School Daily Boss

School Daily Boss is the AI control room for schools that do not have a digital ERP. It turns attendance registers, marksheets, and teacher updates into structured school data and a principal-friendly daily brief.

## Phase 1 foundation

- React + Vite responsive web app at `/`
- Express API at `/api`
- PostgreSQL schema with Drizzle ORM
- Clerk-managed authentication wiring
- Tenant-aware schema: every school-owned record includes `schoolId`
- Clearly labelled Saraswati Vidya Mandir demo school with sample classes, students, attendance, marks, and insights
- OpenAPI-first API contract with generated React Query and Zod clients

The repository's preconfigured database layer uses Drizzle ORM. The schema keeps the same PostgreSQL ownership and isolation model requested for the MVP without introducing a second ORM into the workspace.

## Run locally

```bash
pnpm install
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-spec run codegen
psql "$DATABASE_URL" -f lib/db/demo-seed.sql
pnpm --filter @workspace/api-server run dev
```

The web app is served through the managed workflow:

```bash
pnpm --filter @workspace/school-daily-boss run dev
```

Run the full checks:

```bash
pnpm run typecheck
pnpm --filter @workspace/school-daily-boss run build
```

## Environment

Copy `.env.example` to `.env` for a local setup. Replit provisions `DATABASE_URL` and the Clerk keys in the workspace environment.

## Product routes

- `/` — today's principal command center
- `/attendance` — attendance overview and review-before-save extraction
- `/marks` — marks overview and review-before-save extraction
- `/teacher-updates` — voice-note transcription and structured review
- `/changes` — today, yesterday, last 7 days, and last 30 days comparisons
- `/insights` — evidence-led issue list and detail
- `/students` — student register
- `/teachers` — teacher directory
- `/settings` — school profile controls
- `/sign-in` and `/sign-up` — Clerk authentication

## Data and safety notes

AI outputs are previewed before confirmation. Confidence and source metadata are retained in the schema. Insights use observable evidence and keep suggested actions separate from facts. The schema includes audit logs for confirmed records and AI-generated insights.

## Important files

- `lib/api-spec/openapi.yaml` — API source of truth
- `lib/db/src/schema/school.ts` — PostgreSQL tables and insert schemas
- `artifacts/api-server/src/routes/school.ts` — school workflow API
- `artifacts/api-server/src/lib/demo-data.ts` — development demo provider
- `artifacts/school-daily-boss/src/App.tsx` — responsive product surface