-- DropIndex
DROP INDEX `Staff_aadharNumber_key` ON `Staff`;

-- AlterTable
ALTER TABLE `Staff` ADD COLUMN `aadharHash` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Staff_aadharHash_key` ON `Staff`(`aadharHash`);
