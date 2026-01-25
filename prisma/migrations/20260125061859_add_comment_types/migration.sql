-- CreateEnum
CREATE TYPE "CommentType" AS ENUM ('COMMENT', 'QUESTION', 'BLOCKER');

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "type" "CommentType" NOT NULL DEFAULT 'COMMENT';
