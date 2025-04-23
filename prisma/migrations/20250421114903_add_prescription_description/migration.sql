/*
  Warnings:

  - You are about to drop the `prescription` table. If the table is not empty, all the data it contains will be lost.
*/

-- Drop Foreign Key Constraint from PrescriptionMedicine
ALTER TABLE `PrescriptionMedicine` DROP FOREIGN KEY `PrescriptionMedicine_prescriptionId_fkey`;

-- Drop Foreign Key Constraint from Prescription
ALTER TABLE `prescription` DROP FOREIGN KEY `Prescription_appointmentId_fkey`;

-- Drop the `prescription` table
DROP TABLE `prescription`;

-- Create the new `Prescription` table with updated structure
CREATE TABLE `Prescription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointmentId` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `dosage` VARCHAR(191) NULL,
    `duration` VARCHAR(191) NULL,
    `frequency` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Re-add Foreign Key Constraint on `appointmentId` in `Prescription`
ALTER TABLE `Prescription` ADD CONSTRAINT `Prescription_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Re-add Foreign Key Constraint on `prescriptionId` in `PrescriptionMedicine`
ALTER TABLE `PrescriptionMedicine` ADD CONSTRAINT `PrescriptionMedicine_prescriptionId_fkey` FOREIGN KEY (`prescriptionId`) REFERENCES `Prescription`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;