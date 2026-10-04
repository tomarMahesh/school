-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `Attendance_markedById_fkey`;

-- DropIndex
DROP INDEX `Attendance_markedById_fkey` ON `attendance`;

-- AlterTable
ALTER TABLE `attendance` MODIFY `markedById` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_markedById_fkey` FOREIGN KEY (`markedById`) REFERENCES `Staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
