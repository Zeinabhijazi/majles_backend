-- AlterTable
ALTER TABLE "majlesDB"."user" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "majlesDB"."EmailVerification" (
    "id" SERIAL NOT NULL,
    "tokenId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "EmailVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_tokenId_key" ON "majlesDB"."EmailVerification"("tokenId");

-- AddForeignKey
ALTER TABLE "majlesDB"."EmailVerification" ADD CONSTRAINT "EmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "majlesDB"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
