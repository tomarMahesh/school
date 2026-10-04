-- DropForeignKey
ALTER TABLE `class` DROP FOREIGN KEY `Class_academicYearId_fkey`;

-- DropIndex
DROP INDEX `Class_academicYearId_fkey` ON `class`;

-- AlterTable
ALTER TABLE `class` MODIFY `academicYearId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Class` ADD CONSTRAINT `Class_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `AcademicYear`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
