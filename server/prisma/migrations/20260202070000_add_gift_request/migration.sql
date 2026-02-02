-- AlterTable
ALTER TABLE "GameSave" ADD COLUMN "legendaryProgress" TEXT NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE "GiftRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "giftType" TEXT NOT NULL,
    "giftPokemon" TEXT,
    "giftItemId" TEXT,
    "giftItemQuantity" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GiftRequest_senderId_idx" ON "GiftRequest"("senderId");

-- CreateIndex
CREATE INDEX "GiftRequest_receiverId_idx" ON "GiftRequest"("receiverId");

-- CreateIndex
CREATE INDEX "GiftRequest_status_idx" ON "GiftRequest"("status");

-- AddForeignKey
ALTER TABLE "GiftRequest" ADD CONSTRAINT "GiftRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftRequest" ADD CONSTRAINT "GiftRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
