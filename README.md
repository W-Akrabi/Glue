Glue is the approvals OS for fast-moving teams. We turn messy requests into structured records, route them to the right people, and keep every decision on time with clear accountability.

## Why teams buy Glue
- Design approval flows per record type and keep them consistent across the org
- Assign specific approvers per step (multiple users) with role-aware gates
- Track SLAs, send overdue reminders, and escalate with one click
- See live status, audit trails, and decision history in one place
- No billing gate; orgs can start immediately

## Product highlights
- Workflow builder for entity types
- Per-step assignee lists
- SLA tracking and in-app notifications
- Approval comments with @mentions
- Status clarity across dashboard and record views

## Local setup
1) Install deps
```bash
npm install
```

2) Configure env
Create `.env.local` with:
```bash
DATABASE_URL=postgresql://...
AUTH_SECRET=...
```

3) Migrate + seed
```bash
npx prisma migrate dev
npx prisma db seed
```

4) Run
```bash
npm run dev:local
```

## Environment switching (Local vs Supabase)
Use explicit scripts so you always know which database target is active.

App runtime:
- Local DB (reads `.env.local`):
```bash
npm run dev:local
```
- Supabase DB (reads `.env.production`):
```bash
npm run dev:supabase
```

Prisma / database commands:
- Local Prisma Studio (reads `.env`):
```bash
npm run db:local:studio
```
- Supabase migration status:
```bash
npm run db:supabase:status
```
- Apply Supabase migrations:
```bash
npm run db:supabase:migrate
```
- Supabase Prisma Studio:
```bash
npm run db:supabase:studio
```

Compatibility alias:
- `npm run db:prod:migrate` maps to `npm run db:supabase:migrate`.

## Command reference
Core app:
- `npm run dev` -> default Next dev mode
- `npm run dev:local` -> dev server with local env file
- `npm run dev:supabase` -> dev server with production env file (Supabase)
- `npm run build` -> production build
- `npm run start` -> run built app

Database:
- `npm run db:dev:migrate` -> local Prisma migrate dev flow
- `npm run db:dev:seed` -> local seed
- `npm run db:dev:reset` -> reset local DB
- `npm run db:supabase:status` -> migration status on Supabase DB
- `npm run db:supabase:migrate` -> deploy migrations to Supabase DB
- `npm run db:supabase:studio` -> Prisma Studio against Supabase DB
- `npm run db:local:studio` -> Prisma Studio against local DB

Testing:
- `npm run test` -> Vitest watch
- `npm run test:unit` -> unit tests
- `npm run test:integration` -> integration tests
- `npm run test:coverage` -> coverage report
- `npm run test:e2e` -> Playwright
- `npm run test:e2e:ui` -> Playwright UI mode

## SLA automation
- Configure `SLA_CRON_SECRET` and call `POST /api/sla/run` with header `x-sla-cron-secret`
- Or run `npm run sla:run` from a cron job/background worker
