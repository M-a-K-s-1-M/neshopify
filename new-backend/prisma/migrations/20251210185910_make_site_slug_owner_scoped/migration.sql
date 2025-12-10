/*
  Warnings:

  - A unique constraint covering the columns `[owner_id,slug]` on the table `sites` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "sites_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "sites_owner_id_slug_key" ON "sites"("owner_id", "slug");
