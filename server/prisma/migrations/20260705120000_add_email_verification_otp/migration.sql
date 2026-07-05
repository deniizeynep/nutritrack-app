ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "emailOtpHash" TEXT;
ALTER TABLE "User" ADD COLUMN "emailOtpExpiresAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "emailOtpLastSentAt" TIMESTAMP(3);

UPDATE "User" SET "emailVerified" = true WHERE "authProvider" IN ('email', 'email_google', 'google');
