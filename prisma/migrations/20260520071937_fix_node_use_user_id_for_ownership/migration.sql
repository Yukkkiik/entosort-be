-- AlterTable
ALTER TABLE `nodes` ADD COLUMN `userId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `nodes` ADD CONSTRAINT `nodes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
