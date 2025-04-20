/*
  Warnings:

  - You are about to drop the column `medicineId` on the `prescription` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `prescription` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `prescription` DROP FOREIGN KEY `Prescription_medicineId_fkey`;

-- DropIndex
DROP INDEX `Prescription_medicineId_fkey` ON `prescription`;

-- AlterTable
ALTER TABLE `prescription` DROP COLUMN `medicineId`,
    DROP COLUMN `quantity`;

-- CreateTable
CREATE TABLE `PrescriptionMedicine` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prescriptionId` INTEGER NOT NULL,
    `medicineId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,

    UNIQUE INDEX `PrescriptionMedicine_prescriptionId_medicineId_key`(`prescriptionId`, `medicineId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PrescriptionMedicine` ADD CONSTRAINT `PrescriptionMedicine_prescriptionId_fkey` FOREIGN KEY (`prescriptionId`) REFERENCES `Prescription`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrescriptionMedicine` ADD CONSTRAINT `PrescriptionMedicine_medicineId_fkey` FOREIGN KEY (`medicineId`) REFERENCES `Medicine`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
