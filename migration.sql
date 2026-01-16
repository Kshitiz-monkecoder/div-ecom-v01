-- Migration: Remove clerkUserId, make phone unique and required, make email optional
-- For SQLite/Turso: Since DROP COLUMN is not directly supported, we recreate the table

-- Step 1: Drop the unique indexes that will change
DROP INDEX IF EXISTS "User_clerkUserId_key";
DROP INDEX IF EXISTS "User_email_key";

-- Step 2: Create new User table with updated schema
CREATE TABLE "User_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Copy existing data (migrate from old to new schema)
-- Note: If you have existing users without phone numbers, you'll need to handle them manually
-- This assumes all users have phone numbers or you'll add them later
INSERT INTO "User_new" ("id", "name", "email", "phone", "role", "createdAt")
SELECT 
    "id", 
    "name", 
    "email",  -- Can be NULL now
    COALESCE("phone", "clerkUserId"),  -- Use phone if exists, otherwise use clerkUserId as fallback
    "role", 
    "createdAt"
FROM "User"
WHERE "phone" IS NOT NULL OR "clerkUserId" IS NOT NULL;  -- Only copy users with phone or clerkUserId

-- Step 4: Drop old table
DROP TABLE "User";

-- Step 5: Rename new table
ALTER TABLE "User_new" RENAME TO "User";

-- Step 6: Create new unique index on phone
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
