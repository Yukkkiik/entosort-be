-- AlterTable
ALTER TABLE `nodes` ADD COLUMN `nodeType` ENUM('microcontroller', 'raspberry') NOT NULL DEFAULT 'microcontroller';
