/*
  Warnings:

  - You are about to drop the `EmailVerification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "majlesDB"."EmailVerification" DROP CONSTRAINT "EmailVerification_userId_fkey";

-- DropTable
DROP TABLE "majlesDB"."EmailVerification";

-- CreateTable
CREATE TABLE "majlesDB"."email_Verification" (
    "id" SERIAL NOT NULL,
    "tokenId" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "userId" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "email_Verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_Verification_tokenId_key" ON "majlesDB"."email_Verification"("tokenId");

-- AddForeignKey
ALTER TABLE "majlesDB"."email_Verification" ADD CONSTRAINT "email_Verification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "majlesDB"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
