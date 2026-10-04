-- AlterTable
ALTER TABLE `student` ADD COLUMN `streamId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `_StudentToSubject` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_StudentToSubject_AB_unique`(`A`, `B`),
    INDEX `_StudentToSubject_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Student_streamId_idx` ON `Student`(`streamId`);

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_streamId_fkey` FOREIGN KEY (`streamId`) REFERENCES `Stream`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_StudentToSubject` ADD CONSTRAINT `_StudentToSubject_A_fkey` FOREIGN KEY (`A`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_StudentToSubject` ADD CONSTRAINT `_StudentToSubject_B_fkey` FOREIGN KEY (`B`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
