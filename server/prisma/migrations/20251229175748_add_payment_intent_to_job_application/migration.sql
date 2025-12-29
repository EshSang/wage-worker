/*
  Warnings:

  - You are about to alter the column `paymentDate` on the `order` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `jobapplication` ADD COLUMN `paymentIntentId` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `order` MODIFY `paymentDate` DATETIME NULL;

-- CreateIndex
CREATE INDEX `JobApplication_paymentIntentId_idx` ON `jobapplication`(`paymentIntentId`);
