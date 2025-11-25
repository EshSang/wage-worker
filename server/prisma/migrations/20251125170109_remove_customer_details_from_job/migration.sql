/*
  Warnings:

  - You are about to drop the column `customerAddress` on the `job` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `job` table. All the data in the column will be lost.
  - You are about to drop the column `customerPhone` on the `job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `job` DROP COLUMN `customerAddress`,
    DROP COLUMN `customerName`,
    DROP COLUMN `customerPhone`;
