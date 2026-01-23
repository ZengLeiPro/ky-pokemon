-- DropIndex
DROP INDEX "GameSave_userId_key";

-- AlterTable
ALTER TABLE "GameSave" ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'NORMAL';

-- CreateIndex
CREATE UNIQUE INDEX "GameSave_userId_mode_key" ON "GameSave"("userId", "mode");
