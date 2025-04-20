/*
  Warnings:

  - You are about to drop the column `residentId` on the `Appointment` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Appointment` DROP FOREIGN KEY `Appointment_residentId_fkey`;

-- DropIndex
DROP INDEX `Appointment_residentId_fkey` ON `Appointment`;

-- AlterTable
ALTER TABLE `Appointment` DROP COLUMN `residentId`,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
