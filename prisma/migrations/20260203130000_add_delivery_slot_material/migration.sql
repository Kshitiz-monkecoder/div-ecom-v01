-- AlterTable
ALTER TABLE "Order" ADD COLUMN "deliveryDate" DATETIME;
ALTER TABLE "Order" ADD COLUMN "deliverySlot" TEXT;
ALTER TABLE "Order" ADD COLUMN "isMaterialDelivery" BOOLEAN NOT NULL DEFAULT 0;
