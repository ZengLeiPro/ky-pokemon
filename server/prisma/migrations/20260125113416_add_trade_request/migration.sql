-- CreateTable
CREATE TABLE "TradeRequest" (
    "id" TEXT NOT NULL,
    "initiatorId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "offeredPokemon" TEXT NOT NULL,
    "requestedType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "receiverPokemon" TEXT,
    "message" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TradeRequest_initiatorId_idx" ON "TradeRequest"("initiatorId");

-- CreateIndex
CREATE INDEX "TradeRequest_receiverId_idx" ON "TradeRequest"("receiverId");

-- CreateIndex
CREATE INDEX "TradeRequest_status_idx" ON "TradeRequest"("status");

-- CreateIndex
CREATE INDEX "TradeRequest_isPublic_idx" ON "TradeRequest"("isPublic");

-- AddForeignKey
ALTER TABLE "TradeRequest" ADD CONSTRAINT "TradeRequest_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeRequest" ADD CONSTRAINT "TradeRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
