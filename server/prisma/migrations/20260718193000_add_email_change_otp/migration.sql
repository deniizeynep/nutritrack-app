ALTER TABLE "User"
ADD COLUMN "pendingEmail" TEXT,
ADD COLUMN "emailChangeOtpHash" TEXT,
ADD COLUMN "emailChangeOtpExpiresAt" TIMESTAMP(3),
ADD COLUMN "emailChangeOtpLastSentAt" TIMESTAMP(3),
ADD COLUMN "emailChangeOtpAttempts" INTEGER NOT NULL DEFAULT 0;
