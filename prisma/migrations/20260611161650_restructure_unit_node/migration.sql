/*
  Warnings:

  - You are about to drop the column `nodeId` on the `error_logs` table. All the data in the column will be lost.
  - You are about to drop the column `nodeId` on the `harvest_logs` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `nodes` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `nodes` table. All the data in the column will be lost.
  - You are about to alter the column `nodeType` on the `nodes` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `Enum(EnumId(5))`.
  - You are about to drop the column `nodeId` on the `settings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[unitId,nodeType]` on the table `nodes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[unitId]` on the table `settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `unitId` to the `error_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitId` to the `harvest_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitId` to the `nodes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitId` to the `sensor_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitId` to the `settings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `error_logs` DROP FOREIGN KEY `error_logs_nodeId_fkey`;

-- DropForeignKey
ALTER TABLE `harvest_logs` DROP FOREIGN KEY `harvest_logs_nodeId_fkey`;

-- DropForeignKey
ALTER TABLE `nodes` DROP FOREIGN KEY `nodes_adminId_fkey`;

-- DropForeignKey
ALTER TABLE `nodes` DROP FOREIGN KEY `nodes_userId_fkey`;

-- DropForeignKey
ALTER TABLE `settings` DROP FOREIGN KEY `settings_nodeId_fkey`;

-- DropIndex
DROP INDEX `error_logs_nodeId_idx` ON `error_logs`;

-- DropIndex
DROP INDEX `harvest_logs_nodeId_idx` ON `harvest_logs`;

-- DropIndex
DROP INDEX `nodes_adminId_fkey` ON `nodes`;

-- DropIndex
DROP INDEX `nodes_userId_fkey` ON `nodes`;

-- DropIndex
DROP INDEX `settings_nodeId_key` ON `settings`;

-- AlterTable
ALTER TABLE `error_logs` DROP COLUMN `nodeId`,
    ADD COLUMN `nodeType` ENUM('esp32', 'raspberry') NULL,
    ADD COLUMN `unitId` VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `harvest_logs` DROP COLUMN `nodeId`,
    ADD COLUMN `triggerSource` ENUM('ir_sensor', 'manual') NOT NULL DEFAULT 'ir_sensor',
    ADD COLUMN `unitId` VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `nodes` DROP COLUMN `adminId`,
    DROP COLUMN `userId`,
    ADD COLUMN `unitId` VARCHAR(50) NOT NULL,
    MODIFY `nodeType` ENUM('esp32', 'raspberry') NOT NULL;

-- AlterTable
ALTER TABLE `sensor_logs` ADD COLUMN `unitId` VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `settings` DROP COLUMN `nodeId`,
    ADD COLUMN `unitId` VARCHAR(50) NOT NULL;

-- CreateTable
CREATE TABLE `units` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unitId` VARCHAR(50) NOT NULL,
    `adminId` INTEGER NULL,
    `peterId` INTEGER NULL,
    `location` VARCHAR(100) NULL,
    `status` ENUM('online', 'offline') NOT NULL DEFAULT 'offline',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `units_unitId_key`(`unitId`),
    UNIQUE INDEX `units_peterId_key`(`peterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `error_logs_unitId_idx` ON `error_logs`(`unitId`);

-- CreateIndex
CREATE INDEX `harvest_logs_unitId_idx` ON `harvest_logs`(`unitId`);

-- CreateIndex
CREATE INDEX `nodes_unitId_idx` ON `nodes`(`unitId`);

-- CreateIndex
CREATE UNIQUE INDEX `nodes_unitId_nodeType_key` ON `nodes`(`unitId`, `nodeType`);

-- CreateIndex
CREATE INDEX `sensor_logs_unitId_idx` ON `sensor_logs`(`unitId`);

-- CreateIndex
CREATE UNIQUE INDEX `settings_unitId_key` ON `settings`(`unitId`);

-- AddForeignKey
ALTER TABLE `units` ADD CONSTRAINT `units_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `units` ADD CONSTRAINT `units_peterId_fkey` FOREIGN KEY (`peterId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nodes` ADD CONSTRAINT `nodes_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`unitId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `settings` ADD CONSTRAINT `settings_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`unitId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sensor_logs` ADD CONSTRAINT `sensor_logs_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`unitId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `harvest_logs` ADD CONSTRAINT `harvest_logs_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`unitId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `error_logs` ADD CONSTRAINT `error_logs_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`unitId`) ON DELETE CASCADE ON UPDATE CASCADE;
