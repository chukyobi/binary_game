/*
  Warnings:

  - You are about to alter the column `animationUrls` on the `Character` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to drop the `Obstacle` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `Environment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Character` MODIFY `animationUrls` JSON NULL;

-- AlterTable
ALTER TABLE `Environment` ADD COLUMN `description` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `Obstacle`;

-- CreateIndex
CREATE INDEX `GameProgress_userId_levelId_idx` ON `GameProgress`(`userId`, `levelId`);

-- CreateIndex
CREATE INDEX `GameProgress_score_idx` ON `GameProgress`(`score`);

-- CreateIndex
CREATE INDEX `Question_levelId_type_idx` ON `Question`(`levelId`, `type`);

-- CreateIndex
CREATE INDEX `Question_difficulty_idx` ON `Question`(`difficulty`);
