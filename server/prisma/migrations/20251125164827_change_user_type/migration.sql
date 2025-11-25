/*
  Warnings:

  - You are about to alter the column `usertype` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `usertype` ENUM('USER', 'ADMIN', 'REVIEWER') NOT NULL DEFAULT 'USER';
