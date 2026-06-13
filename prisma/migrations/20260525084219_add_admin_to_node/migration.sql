-- AlterTable
ALTER TABLE `nodes` ADD COLUMN `adminId` INTEGER NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('superadmin', 'admin', 'peternak') NOT NULL DEFAULT 'peternak';

-- AddForeignKey
ALTER TABLE `nodes` ADD CONSTRAINT `nodes_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
