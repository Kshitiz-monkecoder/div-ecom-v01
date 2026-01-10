-- Remove productId from Order table
-- This completes the migration by recreating Order table without productId

-- Step 1: Create new Order table without productId
CREATE TABLE "Order_temp" (
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
    CONSTRAINT "Order_temp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Step 2: Copy data from old Order table to new one
INSERT INTO "Order_temp" ("id", "orderNumber", "userId", "status", "address", "phone", "notes", "warrantyCardUrl", "invoiceUrl", "additionalFiles", "createdAt")
SELECT 
    "id",
    COALESCE("orderNumber", 'ORD-' || strftime('%Y', "createdAt") || '-000') as "orderNumber",
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

-- Step 3: Ensure all orders have orderNumbers (safety check)
UPDATE "Order_temp"
SET "orderNumber" = (
    'ORD-' || 
    strftime('%Y', "createdAt") || 
    '-' || 
    printf('%03d', (
        SELECT COUNT(*)
        FROM "Order_temp" o2
        WHERE strftime('%Y', o2."createdAt") = strftime('%Y', "Order_temp"."createdAt")
        AND o2."createdAt" <= "Order_temp"."createdAt"
    ))
)
WHERE "orderNumber" IS NULL OR "orderNumber" = '';

-- Step 4: Drop old Order table (this will fail if there are foreign key references that prevent it)
-- First, we need to handle any constraints
DROP TABLE "Order";

-- Step 5: Rename new table to Order
ALTER TABLE "Order_temp" RENAME TO "Order";

-- Step 6: Recreate the unique index
CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber");
