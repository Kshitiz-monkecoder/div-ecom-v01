-- Migration: Orders Redesign - Multi-Product Support
-- This migration restructures the Order system to support multiple products per order

-- Step 1: Create OrderItem table
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,  -- Nullable: can be null if product is deleted (for historical records)
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "capacity" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Step 2: Create index on orderId for OrderItem
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- Step 3: Add new columns to Order table
-- Note: We'll add these as nullable first, then migrate data
ALTER TABLE "Order" ADD COLUMN "orderNumber" TEXT;
ALTER TABLE "Order" ADD COLUMN "warrantyCardUrl" TEXT;
ALTER TABLE "Order" ADD COLUMN "invoiceUrl" TEXT;
ALTER TABLE "Order" ADD COLUMN "additionalFiles" TEXT;

-- Step 4: Migrate existing order data to OrderItem
-- For each existing order, create an OrderItem with the product data
INSERT INTO "OrderItem" ("id", "orderId", "productId", "quantity", "unitPrice", "name", "description", "capacity", "createdAt")
SELECT 
    lower(hex(randomblob(16))) as id,
    o."id" as orderId,
    o."productId" as productId,
    1 as quantity,
    p."price" as unitPrice,
    p."name" as name,
    p."description" as description,
    p."capacity" as capacity,
    o."createdAt" as createdAt
FROM "Order" o
JOIN "Product" p ON o."productId" = p."id";

-- Step 5: Generate order numbers for existing orders
-- Format: ORD-YYYY-XXX where YYYY is year and XXX is sequential number
-- We'll generate them based on creation date
UPDATE "Order"
SET "orderNumber" = (
    'ORD-' || 
    strftime('%Y', "createdAt") || 
    '-' || 
    printf('%03d', (
        SELECT COUNT(*) + 1
        FROM "Order" o2
        WHERE strftime('%Y', o2."createdAt") = strftime('%Y', "Order"."createdAt")
        AND o2."createdAt" <= "Order"."createdAt"
    ))
)
WHERE "orderNumber" IS NULL;

-- Step 6: Make orderNumber NOT NULL and add unique constraint
-- First ensure all orders have order numbers
-- Then we can make it NOT NULL (but SQLite doesn't support ALTER COLUMN, so we'll keep it nullable for now)
-- Add unique constraint
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- Step 7: Remove productId from Order table
-- SQLite doesn't support DROP COLUMN directly, so we need to recreate the table
-- This is a more complex migration that requires:
-- 1. Create new Order table structure
-- 2. Copy data
-- 3. Drop old table
-- 4. Rename new table

-- Create new Order table without productId
CREATE TABLE "Order_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "notes" TEXT,
    "warrantyCardUrl" TEXT,
    "invoiceUrl" TEXT,
    "additionalFiles" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_new_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copy data from old Order table to new one
INSERT INTO "Order_new" ("id", "orderNumber", "userId", "status", "address", "phone", "notes", "warrantyCardUrl", "invoiceUrl", "additionalFiles", "createdAt")
SELECT 
    "id",
    COALESCE("orderNumber", 'ORD-' || strftime('%Y', "createdAt") || '-000'),
    "userId",
    "status",
    "address",
    "phone",
    "notes",
    "warrantyCardUrl",
    "invoiceUrl",
    "additionalFiles",
    "createdAt"
FROM "Order";

-- Drop old Order table
DROP TABLE "Order";

-- Rename new table to Order
ALTER TABLE "Order_new" RENAME TO "Order";

-- Recreate foreign key constraint (SQLite doesn't preserve constraints in rename, but they exist in the schema)
