/*
  Warnings:

  - You are about to drop the column `requestId` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the `approval_steps` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `approval_workflow_steps` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "approval_steps" DROP CONSTRAINT "approval_steps_requestId_fkey";

-- DropForeignKey
ALTER TABLE "approval_workflow_steps" DROP CONSTRAINT "approval_workflow_steps_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_requestId_fkey";

-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_createdById_fkey";

-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_organizationId_fkey";

-- DropIndex
DROP INDEX "audit_logs_requestId_idx";

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "requestId";

-- DropTable
DROP TABLE "approval_steps";

-- DropTable
DROP TABLE "approval_workflow_steps";

-- DropTable
DROP TABLE "requests";

-- CreateTable
CREATE TABLE "entity_types" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schema" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entity_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "records" (
    "id" TEXT NOT NULL,
    "entityTypeId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_definitions" (
    "id" TEXT NOT NULL,
    "entityTypeId" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_instances" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_step_instances" (
    "id" TEXT NOT NULL,
    "workflowInstanceId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_step_instances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "entity_types_organizationId_name_key" ON "entity_types"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_definitions_entityTypeId_key" ON "workflow_definitions"("entityTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_instances_recordId_key" ON "workflow_instances"("recordId");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_step_instances_workflowInstanceId_stepNumber_key" ON "workflow_step_instances"("workflowInstanceId", "stepNumber");

-- AddForeignKey
ALTER TABLE "entity_types" ADD CONSTRAINT "entity_types_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_entityTypeId_fkey" FOREIGN KEY ("entityTypeId") REFERENCES "entity_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_definitions" ADD CONSTRAINT "workflow_definitions_entityTypeId_fkey" FOREIGN KEY ("entityTypeId") REFERENCES "entity_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_step_instances" ADD CONSTRAINT "workflow_step_instances_workflowInstanceId_fkey" FOREIGN KEY ("workflowInstanceId") REFERENCES "workflow_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_step_instances" ADD CONSTRAINT "workflow_step_instances_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
