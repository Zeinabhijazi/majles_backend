/*
  Warnings:

  - You are about to drop the `email_Verification` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "majlesDB"."verification_status" AS ENUM ('verifyEmail', 'forgetPassword');

-- DropForeignKey
ALTER TABLE "majlesDB"."email_Verification" DROP CONSTRAINT "email_Verification_userId_fkey";

-- DropTable
DROP TABLE "majlesDB"."email_Verification";

-- CreateTable
CREATE TABLE "majlesDB"."Verification" (
    "id" SERIAL NOT NULL,
    "tokenId" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "status" "majlesDB"."verification_status" NOT NULL,
    "userId" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Verification_tokenId_key" ON "majlesDB"."Verification"("tokenId");

-- AddForeignKey
ALTER TABLE "majlesDB"."Verification" ADD CONSTRAINT "Verification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "majlesDB"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
