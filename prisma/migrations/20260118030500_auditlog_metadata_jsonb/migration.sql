ALTER TABLE "audit_logs"
ALTER COLUMN "metadata" TYPE JSONB
USING "metadata"::jsonb;
