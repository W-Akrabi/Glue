/*
  Warnings:

  - You are about to drop the column `assignedApproverId` on the `workflow_step_instances` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "workflow_step_instances" DROP CONSTRAINT "workflow_step_instances_assignedApproverId_fkey";

-- AlterTable
ALTER TABLE "workflow_step_instances" DROP COLUMN "assignedApproverId",
ADD COLUMN     "assignedApproverIds" JSONB;
