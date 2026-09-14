/*
  Warnings:

  - You are about to drop the `teacher` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `Attendance_markedById_fkey`;

-- DropForeignKey
ALTER TABLE `class` DROP FOREIGN KEY `Class_teacherId_fkey`;

-- DropForeignKey
ALTER TABLE `grade` DROP FOREIGN KEY `Grade_givenById_fkey`;

-- DropForeignKey
ALTER TABLE `teacher` DROP FOREIGN KEY `Teacher_userId_fkey`;

-- DropIndex
DROP INDEX `Attendance_markedById_fkey` ON `attendance`;

-- DropIndex
DROP INDEX `Class_teacherId_fkey` ON `class`;

-- DropIndex
DROP INDEX `Grade_givenById_fkey` ON `grade`;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('ADMIN', 'PRINCIPAL', 'TEACHER', 'STAFF', 'STUDENT') NOT NULL;

-- DropTable
DROP TABLE `teacher`;

-- CreateTable
CREATE TABLE `Staff` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `designation` VARCHAR(191) NOT NULL,
    `qualification` VARCHAR(191) NULL,
    `education` VARCHAR(191) NULL,
    `aadharNumber` VARCHAR(191) NULL,
    `subjects` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Staff_userId_key`(`userId`),
    UNIQUE INDEX `Staff_aadharNumber_key`(`aadharNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Staff` ADD CONSTRAINT `Staff_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Class` ADD CONSTRAINT `Class_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_markedById_fkey` FOREIGN KEY (`markedById`) REFERENCES `Staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Grade` ADD CONSTRAINT `Grade_givenById_fkey` FOREIGN KEY (`givenById`) REFERENCES `Staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
