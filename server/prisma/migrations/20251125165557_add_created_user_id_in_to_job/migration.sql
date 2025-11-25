/*
  Warnings:

  - You are about to drop the column `submittedUserEmail` on the `job` table. All the data in the column will be lost.
  - Added the required column `createdUserId` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `job` DROP COLUMN `submittedUserEmail`,
    ADD COLUMN `createdUserId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_createdUserId_fkey` FOREIGN KEY (`createdUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
