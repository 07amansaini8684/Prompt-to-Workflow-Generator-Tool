/*
  Warnings:

  - Added the required column `userId` to the `WorkflowTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkflowTemplate" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "WorkflowTemplate_userId_idx" ON "WorkflowTemplate"("userId");

-- AddForeignKey
ALTER TABLE "WorkflowTemplate" ADD CONSTRAINT "WorkflowTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
