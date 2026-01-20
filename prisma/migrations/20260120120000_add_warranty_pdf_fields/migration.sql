-- Add warranty PDF persistence fields
ALTER TABLE "Order" ADD COLUMN "warrantyDocumentNo" TEXT;
ALTER TABLE "Order" ADD COLUMN "warrantyPdfData" TEXT;

