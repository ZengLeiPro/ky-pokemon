-- CreateTable
CREATE TABLE "DailyEvent" (
    "id" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "payload" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyEvent_eventKey_key" ON "DailyEvent"("eventKey");
