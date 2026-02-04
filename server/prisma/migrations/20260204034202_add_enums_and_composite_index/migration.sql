-- CreateEnum
CREATE TYPE "GameMode" AS ENUM ('NORMAL', 'CHEAT');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('pending', 'accepted', 'completed', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "BattleStatus" AS ENUM ('pending', 'active', 'finished', 'cancelled');

-- CreateEnum
CREATE TYPE "GiftType" AS ENUM ('pokemon', 'item');

-- CreateEnum
CREATE TYPE "GiftStatus" AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "PokedexStatus" AS ENUM ('SEEN', 'CAUGHT');

-- AlterTable: Convert String columns to Enum types (preserving existing data)
ALTER TABLE "GameSave" ALTER COLUMN "mode" DROP DEFAULT,
  ALTER COLUMN "mode" TYPE "GameMode" USING "mode"::"GameMode",
  ALTER COLUMN "mode" SET DEFAULT 'NORMAL';

ALTER TABLE "Friendship" ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "FriendshipStatus" USING "status"::"FriendshipStatus",
  ALTER COLUMN "status" SET DEFAULT 'pending';

ALTER TABLE "TradeRequest" ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "TradeStatus" USING "status"::"TradeStatus",
  ALTER COLUMN "status" SET DEFAULT 'pending';

ALTER TABLE "Battle" ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "BattleStatus" USING "status"::"BattleStatus",
  ALTER COLUMN "status" SET DEFAULT 'pending';

ALTER TABLE "GiftRequest" ALTER COLUMN "giftType" TYPE "GiftType" USING "giftType"::"GiftType";
ALTER TABLE "GiftRequest" ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "GiftStatus" USING "status"::"GiftStatus",
  ALTER COLUMN "status" SET DEFAULT 'pending';

ALTER TABLE "PokedexEntry" ALTER COLUMN "status" TYPE "PokedexStatus" USING "status"::"PokedexStatus";

-- DropIndex (replace single-column with composite index)
DROP INDEX "BattleTurnLog_battleId_idx";

-- CreateIndex
CREATE INDEX "BattleTurnLog_battleId_turn_idx" ON "BattleTurnLog"("battleId", "turn");
