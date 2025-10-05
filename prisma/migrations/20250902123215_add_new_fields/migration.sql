-- AlterTable
ALTER TABLE "majlesDB"."order" ADD COLUMN     "is_accepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "majlesDB"."user" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;
