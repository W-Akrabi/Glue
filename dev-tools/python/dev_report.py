#!/usr/bin/env python3
"""Simple local-only report for developers."""
import os
import sys
try:
    import psycopg
    from psycopg.rows import dict_row
except ModuleNotFoundError as exc:
    print("Missing dependency: psycopg")
    print("Install with: python3 -m pip install -r dev-tools/python/requirements.txt")
    raise exc

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("DATABASE_URL is not set. Use .env.local for local dev.")
    sys.exit(1)

query = """
SELECT
  (SELECT COUNT(*) FROM records) AS total_records,
  (SELECT COUNT(*) FROM records WHERE status = 'PENDING_APPROVAL') AS pending,
  (SELECT COUNT(*) FROM records WHERE status = 'APPROVED') AS approved,
  (SELECT COUNT(*) FROM records WHERE status = 'REJECTED') AS rejected
"""

with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
    with conn.cursor() as cur:
        cur.execute(query)
        row = cur.fetchone()

print("Local Glue report")
print(f"Total records: {row['total_records']}")
print(f"Pending approvals: {row['pending']}")
print(f"Approved: {row['approved']}")
print(f"Rejected: {row['rejected']}")
