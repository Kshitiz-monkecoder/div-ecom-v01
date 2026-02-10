-- Add subCategories column to Ticket table
-- This script is idempotent - safe to run multiple times
-- If column already exists, it will show an error but won't break anything

ALTER TABLE "Ticket" ADD COLUMN "subCategories" TEXT;
