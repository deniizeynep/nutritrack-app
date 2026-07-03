-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "authProvider" TEXT NOT NULL DEFAULT 'email';

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
