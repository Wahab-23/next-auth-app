/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `Record` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Record_date_key` ON `Record`(`date`);
