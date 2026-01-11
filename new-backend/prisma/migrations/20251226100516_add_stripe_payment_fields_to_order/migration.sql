-- Add payment fields for Stripe (and other providers) to orders

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_provider" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_intent_id" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_session_id" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_details" JSONB;

-- Ensure cart uniqueness constraints exist (user cart and guest cart)
-- Note: In a fresh dev database these will be created cleanly.
CREATE UNIQUE INDEX IF NOT EXISTS "carts_site_id_session_id_key" ON "carts"("site_id", "session_id");
CREATE UNIQUE INDEX IF NOT EXISTS "carts_site_id_user_id_key" ON "carts"("site_id", "user_id");
