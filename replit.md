# School Daily Boss

School Daily Boss turns school registers, marksheets, and teacher updates into an evidence-led daily control room for principals and teachers.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string; Clerk keys are provisioned for authentication

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract and codegen source
- `lib/db/src/schema/school.ts` — tenant-aware PostgreSQL schema
- `artifacts/api-server/src/routes/school.ts` — school workflow API
- `artifacts/school-daily-boss/src/App.tsx` — responsive web product

## Architecture decisions

- Keep the preconfigured Drizzle layer instead of introducing Prisma alongside it.
- Use an explicit `schoolId` on every school-owned table so authorization can be enforced at query boundaries.
- Keep demo responses in a dedicated provider while extraction/AI services mature behind the same OpenAPI contract.

## Product

- Dashboard, attendance, marks, teacher updates, change comparisons, insights, issue evidence, principal chat, and basic student/teacher management are available in demo mode.

## User preferences

- AI outputs are suggestions backed by evidence, not facts or diagnoses.

## Gotchas

- Run API codegen after every OpenAPI change.
- Use `schoolId` scope in every future database query and mutation.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
