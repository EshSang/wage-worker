-- AlterTable
ALTER TABLE `order` ADD COLUMN `paidAmount` DECIMAL(10, 2) NULL,
    ADD COLUMN `paymentDate` DATETIME NULL,
    ADD COLUMN `paymentIntentId` VARCHAR(255) NULL,
    ADD COLUMN `paymentStatus` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX `Order_paymentIntentId_idx` ON `order`(`paymentIntentId`);
