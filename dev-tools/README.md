# Dev Tools (Local Only)

This folder contains developer-only scripts and utilities.
They are not used by the production app and should only be run locally.

## Python
- `python/dev_report.py` – sample script that queries the DB and prints counts.
  - Install deps: `npm run dev:py:setup` (uses the same python as the script)
  - Requires `DATABASE_URL` (from `.env.local`).

## Java
- `java/HelloTool.java` – sample Java CLI tool placeholder.

Run via the npm scripts:
- `npm run dev:py:report`
- `npm run dev:java:hello`
