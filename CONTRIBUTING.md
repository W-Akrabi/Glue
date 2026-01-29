# Contributing to Glue

Thanks for your interest in contributing! This project is a Next.js + Prisma app with a workflow approvals core. This guide covers the basics to get you productive quickly.

## Getting started

1) Install dependencies

```bash
npm install
```

2) Configure environment

- Create `.env.local` and set `DATABASE_URL` for Postgres.

3) Run Prisma migrations

```bash
npx prisma migrate dev
```

4) Start the dev server

```bash
npm run dev
```

## Project structure

- `app/` — Next.js App Router pages and API routes
- `lib/` — server actions, domain logic, helpers
- `prisma/` — Prisma schema and migrations
- `components/` — UI components

## Approval workflow logic

- Record creation builds a workflow instance with ordered steps.
- Each step has assigned approver IDs and optional SLA settings.
- Approval is blocked if unresolved blocker comments exist.

## Comments and mentions

- Top-level comments can be `COMMENT`, `QUESTION`, or `BLOCKER`.
- Replies are limited to one level.
- Mentions create in-app notifications.

## Code style

- Prefer server actions in `lib/actions/*`.
- Keep components small and focused.
- Avoid cross-cutting side effects in UI components.

## Testing

There is no formal test suite yet. Please include manual test notes in your PR description.

## Submitting changes

1) Create a branch
2) Keep changes focused
3) Update docs if behavior changes
4) Open a PR with screenshots or notes for UI changes
