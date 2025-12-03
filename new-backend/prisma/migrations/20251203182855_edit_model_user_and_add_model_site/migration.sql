/*
  Warnings:

  - You are about to drop the `tokens` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[siteId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "siteId" TEXT;

-- DropTable
DROP TABLE "tokens";

-- CreateTable
CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sites_domain_key" ON "sites"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "sites_ownerId_key" ON "sites"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "users_siteId_key" ON "users"("siteId");

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
