-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "aiGeneratedCopy" JSONB,
ADD COLUMN     "platform" TEXT NOT NULL DEFAULT 'LINE',
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "sendStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "sentAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Promotion_sendStatus_scheduledAt_idx" ON "Promotion"("sendStatus", "scheduledAt");
