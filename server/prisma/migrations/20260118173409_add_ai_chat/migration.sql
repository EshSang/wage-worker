-- AlterTable
ALTER TABLE `job` ADD COLUMN `approvalStatus` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `reviewNotes` VARCHAR(1000) NULL,
    ADD COLUMN `reviewedAt` DATETIME(0) NULL,
    ADD COLUMN `reviewedBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `review` ADD COLUMN `approvalStatus` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `reviewedAt` DATETIME(0) NULL,
    ADD COLUMN `reviewedBy` INTEGER NULL;

-- CreateTable
CREATE TABLE `chat_session` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `title` VARCHAR(255) NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL,

    INDEX `ChatSession_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_message` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionId` INTEGER NOT NULL,
    `role` ENUM('USER', 'ASSISTANT', 'SYSTEM') NOT NULL DEFAULT 'USER',
    `content` TEXT NOT NULL,
    `intent` VARCHAR(50) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `ChatMessage_sessionId_idx`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Job_reviewedBy_fkey` ON `job`(`reviewedBy`);

-- CreateIndex
CREATE INDEX `Job_approvalStatus_idx` ON `job`(`approvalStatus`);

-- CreateIndex
CREATE INDEX `Review_reviewedBy_fkey` ON `review`(`reviewedBy`);

-- CreateIndex
CREATE INDEX `Review_approvalStatus_idx` ON `review`(`approvalStatus`);

-- AddForeignKey
ALTER TABLE `job` ADD CONSTRAINT `Job_reviewedBy_fkey` FOREIGN KEY (`reviewedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `Review_reviewedBy_fkey` FOREIGN KEY (`reviewedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_session` ADD CONSTRAINT `ChatSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_message` ADD CONSTRAINT `ChatMessage_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `chat_session`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
