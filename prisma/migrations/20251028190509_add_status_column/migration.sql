/*
  Warnings:

  - You are about to drop the column `is_accepted` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `order` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "majlesDB"."order_status" AS ENUM ('pending', 'completed', 'deleted', 'rejected', 'accepted');

-- AlterTable
ALTER TABLE "majlesDB"."order" DROP COLUMN "is_accepted",
DROP COLUMN "is_deleted",
ADD COLUMN     "status" "majlesDB"."order_status" NOT NULL DEFAULT 'pending';
