ALTER TABLE "User" ADD COLUMN "passwordResetOtpHash" TEXT;
ALTER TABLE "User" ADD COLUMN "passwordResetOtpExpiresAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "passwordResetOtpLastSentAt" TIMESTAMP(3);
