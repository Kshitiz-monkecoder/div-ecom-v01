-- Quick fix: Add missing columns to Order table
-- Run this first to fix the immediate error

-- Add orderNumber column (if it doesn't exist - SQLite will error but can be ignored)
ALTER TABLE "Order" ADD COLUMN "orderNumber" TEXT;

-- Add other new columns
ALTER TABLE "Order" ADD COLUMN "warrantyCardUrl" TEXT;
ALTER TABLE "Order" ADD COLUMN "invoiceUrl" TEXT;
ALTER TABLE "Order" ADD COLUMN "additionalFiles" TEXT;

-- Populate orderNumber for existing orders
UPDATE "Order"
SET "orderNumber" = (
    'ORD-' || 
    strftime('%Y', "createdAt") || 
    '-' || 
    printf('%03d', (
        SELECT COUNT(*)
        FROM "Order" o2
        WHERE strftime('%Y', o2."createdAt") = strftime('%Y', "Order"."createdAt")
        AND o2."createdAt" <= "Order"."createdAt"
    ))
)
WHERE "orderNumber" IS NULL OR "orderNumber" = '';

-- Add unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber");
