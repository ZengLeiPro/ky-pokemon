-- CreateTable
CREATE TABLE "PokedexEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "speciesId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstCaughtAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PokedexEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PokedexEntry_userId_idx" ON "PokedexEntry"("userId");

-- CreateIndex
CREATE INDEX "PokedexEntry_speciesId_idx" ON "PokedexEntry"("speciesId");

-- CreateIndex
CREATE INDEX "PokedexEntry_status_idx" ON "PokedexEntry"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PokedexEntry_userId_speciesId_key" ON "PokedexEntry"("userId", "speciesId");

-- AddForeignKey
ALTER TABLE "PokedexEntry" ADD CONSTRAINT "PokedexEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
