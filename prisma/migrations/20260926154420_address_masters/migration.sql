-- AlterTable
ALTER TABLE `student` ADD COLUMN `address` TEXT NULL,
    ADD COLUMN `districtId` VARCHAR(191) NULL,
    ADD COLUMN `pincodeId` VARCHAR(191) NULL,
    ADD COLUMN `stateId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `State` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `State_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `District` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `stateId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `District_name_stateId_key`(`name`, `stateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pincode` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `districtId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Pincode_code_districtId_key`(`code`, `districtId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Student_stateId_idx` ON `Student`(`stateId`);

-- CreateIndex
CREATE INDEX `Student_districtId_idx` ON `Student`(`districtId`);

-- CreateIndex
CREATE INDEX `Student_pincodeId_idx` ON `Student`(`pincodeId`);

-- AddForeignKey
ALTER TABLE `District` ADD CONSTRAINT `District_stateId_fkey` FOREIGN KEY (`stateId`) REFERENCES `State`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pincode` ADD CONSTRAINT `Pincode_districtId_fkey` FOREIGN KEY (`districtId`) REFERENCES `District`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_stateId_fkey` FOREIGN KEY (`stateId`) REFERENCES `State`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_districtId_fkey` FOREIGN KEY (`districtId`) REFERENCES `District`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_pincodeId_fkey` FOREIGN KEY (`pincodeId`) REFERENCES `Pincode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
