-- CreateTable
CREATE TABLE "RedeemRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RedeemRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RedeemRecord_code_idx" ON "RedeemRecord"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RedeemRecord_userId_code_key" ON "RedeemRecord"("userId", "code");
