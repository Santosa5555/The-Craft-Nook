/*
  Warnings:

  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomerProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Address" DROP CONSTRAINT "Address_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CustomerProfile" DROP CONSTRAINT "CustomerProfile_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "Region" TEXT,
ADD COLUMN     "Street" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "phoneNubmer" TEXT;

-- DropTable
DROP TABLE "public"."Address";

-- DropTable
DROP TABLE "public"."CustomerProfile";
