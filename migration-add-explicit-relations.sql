-- Migration: Add Explicit Relation Names to User-Product Relationships
-- For SQLite/Turso: This migration documents Prisma schema changes
-- 
-- IMPORTANT: No SQL changes are required for this migration!
-- The changes made are to Prisma schema relation names, which are metadata
-- used by Prisma Client. The actual database schema remains unchanged.
--
-- What changed:
-- 1. Added explicit relation name "UserProducts" to User.products field
-- 2. Added explicit relation name "ProductUsers" to Product.users field
-- 3. Updated UserProduct relations to use explicit names:
--    - UserProduct.user now explicitly references "UserProducts" relation
--    - UserProduct.product now explicitly references "ProductUsers" relation
--
-- These explicit names help Prisma Client correctly identify relationships
-- when the schema has multiple relations between the same models.
--
-- Database Schema Status:
-- The UserProduct table structure is already correct (from previous migration).
-- The foreign key constraints are already in place.
-- No ALTER TABLE statements are needed.

-- Verification Query: Check that UserProduct table exists with correct structure
-- This should already be true if migration-add-userproduct.sql was run
SELECT name FROM sqlite_master 
WHERE type='table' AND name='UserProduct';

-- Expected result: Should return "UserProduct"
-- 
-- Verification Query: Check foreign key constraints exist
-- (Note: SQLite requires PRAGMA foreign_keys=ON to enforce FKs, but they're still defined)
PRAGMA foreign_key_list(UserProduct);

-- Expected results:
-- 1. userId -> User.id (ON DELETE CASCADE)
-- 2. productId -> Product.id (ON DELETE CASCADE)

-- Verification Query: Check unique index exists
SELECT name FROM sqlite_master 
WHERE type='index' AND tbl_name='UserProduct' AND sql LIKE '%UNIQUE%';

-- Expected result: Should return index name for unique constraint on (userId, productId)

-- ============================================================
-- NO SQL EXECUTION NEEDED - This is documentation only
-- ============================================================
-- 
-- To apply the schema changes:
-- 1. The Prisma schema file (prisma/schema.prisma) has been updated
-- 2. Run: npx prisma generate (to regenerate Prisma Client)
-- 3. Restart your Next.js development server
--
-- The database itself requires no changes.

