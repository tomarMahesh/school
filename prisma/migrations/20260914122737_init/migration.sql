-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'TEACHER', 'STUDENT') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Teacher` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NULL,

    UNIQUE INDEX `Teacher_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Student` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `classId` VARCHAR(191) NULL,

    UNIQUE INDEX `Student_userId_key`(`userId`),
    INDEX `Student_classId_idx`(`classId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Class` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NULL,

    UNIQUE INDEX `Class_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attendance` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `classId` VARCHAR(191) NOT NULL,
    `markedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Attendance_classId_date_idx`(`classId`, `date`),
    UNIQUE INDEX `Attendance_studentId_date_key`(`studentId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Grade` (
    `id` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `score` DOUBLE NOT NULL,
    `maxScore` DOUBLE NOT NULL,
    `term` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `givenById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Grade_studentId_term_idx`(`studentId`, `term`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Page` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `authorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Page_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Post` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `category` ENUM('NEWS', 'EVENT', 'ANNOUNCEMENT') NOT NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Post_slug_key`(`slug`),
    INDEX `Post_category_publishedAt_idx`(`category`, `publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Media` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `uploadedById` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Teacher` ADD CONSTRAINT `Teacher_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Class`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Class` ADD CONSTRAINT `Class_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Class`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_markedById_fkey` FOREIGN KEY (`markedById`) REFERENCES `Teacher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Grade` ADD CONSTRAINT `Grade_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Grade` ADD CONSTRAINT `Grade_givenById_fkey` FOREIGN KEY (`givenById`) REFERENCES `Teacher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Page` ADD CONSTRAINT `Page_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Media` ADD CONSTRAINT `Media_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Media` ADD CONSTRAINT `Media_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
