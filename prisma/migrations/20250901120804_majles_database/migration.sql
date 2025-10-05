-- CreateEnum
CREATE TYPE "majlesDB"."Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "majlesDB"."user_type" AS ENUM ('admin', 'client', 'reader');

-- CreateTable
CREATE TABLE "majlesDB"."user" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "gender" "majlesDB"."Gender" NOT NULL,
    "user_type" "majlesDB"."user_type" NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "address_one" TEXT NOT NULL,
    "address_two" TEXT,
    "post_number" INTEGER NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "CREATE_USER_TABLE_PRIMARY_KEY" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "majlesDB"."order" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "reader_id" INTEGER,
    "order_date" TIMESTAMPTZ NOT NULL,
    "longitude" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "address_one" TEXT,
    "address_two" TEXT,
    "post_number" INTEGER,
    "country" TEXT,
    "city" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "CREATE_ORDER_TABLE_PRIMARY_KEY" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "majlesDB"."auth_token" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expiray_date" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "CREATE_AUTH_TOKEN_TABLE_PRIMARY_KEY" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "majlesDB"."user"("email");

-- AddForeignKey
ALTER TABLE "majlesDB"."order" ADD CONSTRAINT "FK_orders_client_id" FOREIGN KEY ("user_id") REFERENCES "majlesDB"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "majlesDB"."order" ADD CONSTRAINT "FK_orders_reader_id" FOREIGN KEY ("reader_id") REFERENCES "majlesDB"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "majlesDB"."auth_token" ADD CONSTRAINT "FK_authToken_user_id" FOREIGN KEY ("user_id") REFERENCES "majlesDB"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
