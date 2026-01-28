-- AlterTable
ALTER TABLE "Battle" ADD COLUMN     "challengerLastSeen" TIMESTAMP(3),
ADD COLUMN     "finishReason" TEXT,
ADD COLUMN     "opponentLastSeen" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastSeenAt" TIMESTAMP(3);
