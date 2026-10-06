-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actorId` VARCHAR(191) NULL,
    `actorName` VARCHAR(191) NULL,
    `actorEmail` VARCHAR(191) NULL,
    `actorRole` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `label` VARCHAR(191) NULL,
    `changes` LONGTEXT NULL,
    `count` INTEGER NOT NULL DEFAULT 1,
    `ip` VARCHAR(191) NULL,

    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    INDEX `AuditLog_entity_entityId_idx`(`entity`, `entityId`),
    INDEX `AuditLog_actorId_createdAt_idx`(`actorId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

