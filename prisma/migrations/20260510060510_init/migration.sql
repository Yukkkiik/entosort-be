-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'peternak') NOT NULL DEFAULT 'peternak',
    `phone` VARCHAR(20) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nodes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nodeId` VARCHAR(50) NOT NULL,
    `ipAddress` VARCHAR(45) NULL,
    `status` ENUM('online', 'offline') NOT NULL DEFAULT 'offline',
    `firmware` VARCHAR(50) NULL,
    `lastSeen` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `nodes_nodeId_key`(`nodeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sensor_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nodeId` VARCHAR(50) NOT NULL,
    `temperature` DOUBLE NOT NULL,
    `humidity` DOUBLE NOT NULL,
    `pressure` DOUBLE NOT NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sensor_logs_nodeId_idx`(`nodeId`),
    INDEX `sensor_logs_recordedAt_idx`(`recordedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `harvest_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nodeId` VARCHAR(50) NOT NULL,
    `userId` INTEGER NULL,
    `larvaCount` INTEGER NOT NULL DEFAULT 0,
    `prepupaCount` INTEGER NOT NULL DEFAULT 0,
    `rejectCount` INTEGER NOT NULL DEFAULT 0,
    `totalCount` INTEGER NOT NULL DEFAULT 0,
    `durationSec` INTEGER NULL,
    `notes` TEXT NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `harvest_logs_nodeId_idx`(`nodeId`),
    INDEX `harvest_logs_recordedAt_idx`(`recordedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `error_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nodeId` VARCHAR(50) NOT NULL,
    `errorCode` VARCHAR(50) NULL,
    `errorType` VARCHAR(100) NOT NULL,
    `message` TEXT NOT NULL,
    `severity` ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    `occurredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolved` BOOLEAN NOT NULL DEFAULT false,

    INDEX `error_logs_nodeId_idx`(`nodeId`),
    INDEX `error_logs_resolved_idx`(`resolved`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nodeId` VARCHAR(50) NOT NULL,
    `hsvLowerH` INTEGER NOT NULL DEFAULT 0,
    `hsvLowerS` INTEGER NOT NULL DEFAULT 0,
    `hsvLowerV` INTEGER NOT NULL DEFAULT 0,
    `hsvUpperH` INTEGER NOT NULL DEFAULT 179,
    `hsvUpperS` INTEGER NOT NULL DEFAULT 255,
    `hsvUpperV` INTEGER NOT NULL DEFAULT 255,
    `irThreshold` INTEGER NOT NULL DEFAULT 500,
    `motorSpeedRpm` INTEGER NOT NULL DEFAULT 100,
    `solenoidDelayMs` INTEGER NOT NULL DEFAULT 200,
    `manualMode` BOOLEAN NOT NULL DEFAULT false,
    `motorOn` BOOLEAN NOT NULL DEFAULT false,
    `solenoidOn` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `settings_nodeId_key`(`nodeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sensor_logs` ADD CONSTRAINT `sensor_logs_nodeId_fkey` FOREIGN KEY (`nodeId`) REFERENCES `nodes`(`nodeId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `harvest_logs` ADD CONSTRAINT `harvest_logs_nodeId_fkey` FOREIGN KEY (`nodeId`) REFERENCES `nodes`(`nodeId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `harvest_logs` ADD CONSTRAINT `harvest_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `error_logs` ADD CONSTRAINT `error_logs_nodeId_fkey` FOREIGN KEY (`nodeId`) REFERENCES `nodes`(`nodeId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `settings` ADD CONSTRAINT `settings_nodeId_fkey` FOREIGN KEY (`nodeId`) REFERENCES `nodes`(`nodeId`) ON DELETE CASCADE ON UPDATE CASCADE;
