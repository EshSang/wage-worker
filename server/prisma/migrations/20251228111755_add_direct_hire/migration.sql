-- AlterTable
ALTER TABLE `job` ADD COLUMN `jobType` VARCHAR(50) NOT NULL DEFAULT 'PUBLIC',
    ADD COLUMN `targetWorkerId` INTEGER NULL;

-- AlterTable
ALTER TABLE `jobapplication` ADD COLUMN `applicationType` VARCHAR(50) NOT NULL DEFAULT 'MANUAL',
    MODIFY `applicationStatus` ENUM('PENDING', 'APPLIED', 'ACCEPTED', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'APPLIED';

-- CreateTable
CREATE TABLE `notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `type` ENUM('ORDER_ACCEPTED', 'ORDER_STARTED', 'ORDER_COMPLETED', 'PAYMENT_RECEIVED', 'FEEDBACK_RECEIVED', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED', 'JOB_APPLIED', 'REVIEW_RECEIVED') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` VARCHAR(1000) NOT NULL,
    `relatedId` INTEGER NULL,
    `relatedType` VARCHAR(50) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `Notification_createdAt_idx`(`createdAt`),
    INDEX `Notification_userId_isRead_idx`(`userId`, `isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Job_targetWorkerId_fkey` ON `job`(`targetWorkerId`);

-- AddForeignKey
ALTER TABLE `job` ADD CONSTRAINT `Job_targetWorkerId_fkey` FOREIGN KEY (`targetWorkerId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
