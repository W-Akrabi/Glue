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
npm run dev
```

## Notes
- SLA checks are manual for now (Admin -> Workflows -> Run SLA check)
