-- AlterTable
ALTER TABLE "GameSave" ADD COLUMN     "devicePokemon" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "playerSpriteIndex" INTEGER NOT NULL DEFAULT 0;
