-- Add new optional columns to Product and Order tables for CSV import
-- Run this before 02_import_data.sql
-- Safe to run: SQLite will error if column exists; ignore and continue

-- Product table (14 new columns)
ALTER TABLE "Product" ADD COLUMN "sno" TEXT;
ALTER TABLE "Product" ADD COLUMN "leadNo" TEXT;
ALTER TABLE "Product" ADD COLUMN "tenure" TEXT;
ALTER TABLE "Product" ADD COLUMN "date" DATETIME;
ALTER TABLE "Product" ADD COLUMN "customerCompanyName" TEXT;
ALTER TABLE "Product" ADD COLUMN "segmentProductType" TEXT;
ALTER TABLE "Product" ADD COLUMN "kWp" TEXT;
ALTER TABLE "Product" ADD COLUMN "structure" TEXT;
ALTER TABLE "Product" ADD COLUMN "inverter" TEXT;
ALTER TABLE "Product" ADD COLUMN "mobileNo" TEXT;
ALTER TABLE "Product" ADD COLUMN "systemType" TEXT;
ALTER TABLE "Product" ADD COLUMN "address" TEXT;
ALTER TABLE "Product" ADD COLUMN "area" TEXT;
ALTER TABLE "Product" ADD COLUMN "solarBrand" TEXT;

-- Order table (11 new columns)
ALTER TABLE "Order" ADD COLUMN "leadNo" TEXT;
ALTER TABLE "Order" ADD COLUMN "tenure" TEXT;
ALTER TABLE "Order" ADD COLUMN "date" DATETIME;
ALTER TABLE "Order" ADD COLUMN "customerCompanyName" TEXT;
ALTER TABLE "Order" ADD COLUMN "segmentProductType" TEXT;
ALTER TABLE "Order" ADD COLUMN "kWp" TEXT;
ALTER TABLE "Order" ADD COLUMN "structure" TEXT;
ALTER TABLE "Order" ADD COLUMN "inverter" TEXT;
ALTER TABLE "Order" ADD COLUMN "systemType" TEXT;
ALTER TABLE "Order" ADD COLUMN "area" TEXT;
ALTER TABLE "Order" ADD COLUMN "solarBrand" TEXT;
