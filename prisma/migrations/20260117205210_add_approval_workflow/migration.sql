-- CreateTable
CREATE TABLE "approval_workflow_steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "requiredRole" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "approval_workflow_steps_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "approval_workflow_steps_organizationId_stepNumber_key" ON "approval_workflow_steps"("organizationId", "stepNumber");
