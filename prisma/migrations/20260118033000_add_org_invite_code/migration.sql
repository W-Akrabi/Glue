ALTER TABLE "organizations"
ADD COLUMN "inviteCode" TEXT;

UPDATE "organizations"
SET "inviteCode" = substr(md5(random()::text), 1, 8)
WHERE "inviteCode" IS NULL;

ALTER TABLE "organizations"
ALTER COLUMN "inviteCode" SET NOT NULL;

CREATE UNIQUE INDEX "organizations_inviteCode_key" ON "organizations"("inviteCode");
