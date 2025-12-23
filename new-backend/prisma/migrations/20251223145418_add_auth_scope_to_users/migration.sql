/*
  Warnings:

  - A unique constraint covering the columns `[site_id,user_id]` on the table `carts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[auth_scope,email]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "auth_scope" TEXT NOT NULL DEFAULT 'platform';

-- CreateIndex
CREATE UNIQUE INDEX "carts_site_id_user_id_key" ON "carts"("site_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_scope_email_key" ON "users"("auth_scope", "email");
