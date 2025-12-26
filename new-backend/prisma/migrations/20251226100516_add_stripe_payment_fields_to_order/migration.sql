-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "payment_details" JSONB,
ADD COLUMN     "payment_intent_id" TEXT,
ADD COLUMN     "payment_provider" TEXT,
ADD COLUMN     "payment_session_id" TEXT;
