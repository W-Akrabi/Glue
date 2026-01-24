-- AlterTable
ALTER TABLE "workflow_step_instances" ADD COLUMN     "assignedApproverId" TEXT;

-- AddForeignKey
ALTER TABLE "workflow_step_instances" ADD CONSTRAINT "workflow_step_instances_assignedApproverId_fkey" FOREIGN KEY ("assignedApproverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
