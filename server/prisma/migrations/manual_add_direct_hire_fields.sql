-- Manual Migration: Add Direct Hire Fields
-- Run this SQL script manually in your MySQL database

-- Add jobType column to Job table
ALTER TABLE `Job`
ADD COLUMN `jobType` VARCHAR(50) NOT NULL DEFAULT 'PUBLIC' AFTER `categoryId`;

-- Add targetWorkerId column to Job table
ALTER TABLE `Job`
ADD COLUMN `targetWorkerId` INT NULL AFTER `jobType`;

-- Add foreign key constraint for targetWorkerId
ALTER TABLE `Job`
ADD CONSTRAINT `Job_targetWorkerId_fkey`
FOREIGN KEY (`targetWorkerId`) REFERENCES `User`(`id`)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Add applicationType column to JobApplication table
ALTER TABLE `JobApplication`
ADD COLUMN `applicationType` VARCHAR(50) NOT NULL DEFAULT 'MANUAL' AFTER `applicationStatus`;

-- Add ACCEPTED status to JobStatus enum (if not already exists)
-- Note: MySQL doesn't have ENUM modification, so we need to check if ACCEPTED exists
-- If your applicationStatus is using VARCHAR instead of ENUM, this step might not be needed

-- Update existing data to set default values
UPDATE `Job` SET `jobType` = 'PUBLIC' WHERE `jobType` IS NULL;
UPDATE `JobApplication` SET `applicationType` = 'MANUAL' WHERE `applicationType` IS NULL;

-- Verify the changes
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Job' AND COLUMN_NAME IN ('jobType', 'targetWorkerId');

SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'JobApplication' AND COLUMN_NAME = 'applicationType';
