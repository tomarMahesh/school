-- DropIndex
DROP INDEX `Class_name_key` ON `class`;

-- AlterTable
ALTER TABLE `class` ADD COLUMN `academicYearId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Class_name_academicYearId_key` ON `Class`(`name`, `academicYearId`);

-- AddForeignKey
ALTER TABLE `Class` ADD CONSTRAINT `Class_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `AcademicYear`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
