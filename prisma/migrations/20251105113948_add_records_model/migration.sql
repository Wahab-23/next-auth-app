-- CreateTable
CREATE TABLE `Record` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `productUploads` INTEGER NOT NULL DEFAULT 0,
    `reOptimizations` INTEGER NOT NULL DEFAULT 0,
    `priceUpdates` INTEGER NOT NULL DEFAULT 0,
    `priceComparisons` INTEGER NOT NULL DEFAULT 0,
    `stockUpdates` INTEGER NOT NULL DEFAULT 0,
    `csvUpdates` INTEGER NOT NULL DEFAULT 0,
    `equivalentUploads` DOUBLE NOT NULL DEFAULT 0,
    `target` INTEGER NOT NULL DEFAULT 50,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Record_userId_idx`(`userId`),
    INDEX `Record_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Record` ADD CONSTRAINT `Record_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
