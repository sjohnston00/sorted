-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_userPasswordId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "displayName" TIMESTAMP(3),
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ALTER COLUMN "userPasswordId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userPasswordId_fkey" FOREIGN KEY ("userPasswordId") REFERENCES "UserPassword"("id") ON DELETE SET NULL ON UPDATE CASCADE;
