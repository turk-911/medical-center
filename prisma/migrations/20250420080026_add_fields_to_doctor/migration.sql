-- AlterTable
ALTER TABLE `Doctor` ADD COLUMN `availability` VARCHAR(191) NOT NULL DEFAULT 'Today',
    ADD COLUMN `image` VARCHAR(191) NOT NULL DEFAULT '/api/placeholder/64/64',
    ADD COLUMN `rating` DOUBLE NOT NULL DEFAULT 4.8;
