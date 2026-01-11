-- Add auth_scope to users and make email unique only within auth_scope

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "auth_scope" TEXT NOT NULL DEFAULT 'platform';

-- Drop old unique constraint/index on email if it existed
DROP INDEX IF EXISTS "users_email_key";

-- Create composite unique index (auth_scope, email)
CREATE UNIQUE INDEX IF NOT EXISTS "users_auth_scope_email_key" ON "users"("auth_scope", "email");
