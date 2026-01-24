/*
  Warnings:

  - You are about to drop the `workflow_graphs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "workflow_graphs" DROP CONSTRAINT "workflow_graphs_organizationId_fkey";

-- AlterTable
ALTER TABLE "records" ALTER COLUMN "status" SET DEFAULT 'PENDING_APPROVAL';

-- AlterTable
ALTER TABLE "workflow_instances" ALTER COLUMN "status" SET DEFAULT 'PENDING_APPROVAL';

-- DropTable
DROP TABLE "workflow_graphs";
