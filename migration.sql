-- Full reset migration: drops all tables and recreates from current schema
-- Run with: turso db shell divy-power-ecom < migration.sql
-- WARNING: Deletes all existing data

PRAGMA foreign_keys = OFF;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS "Token";
DROP TABLE IF EXISTS "Referral";
DROP TABLE IF EXISTS "UserProduct";
DROP TABLE IF EXISTS "OrderStatusHistory";
DROP TABLE IF EXISTS "TicketStatusHistory";
DROP TABLE IF EXISTS "TicketImage";
DROP TABLE IF EXISTS "Ticket";
DROP TABLE IF EXISTS "OrderItem";
DROP TABLE IF EXISTS "Order";
DROP TABLE IF EXISTS "Product";
DROP TABLE IF EXISTS "User";

PRAGMA foreign_keys = ON;

-- User
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referralCode" TEXT NOT NULL
);

-- Product
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "capacity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "isActive" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Order
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "notes" TEXT,
    "warrantyDocumentNo" TEXT,
    "warrantyPdfData" TEXT,
    "warrantyCardUrl" TEXT,
    "invoiceUrl" TEXT,
    "additionalFiles" TEXT,
    "deliveryDate" DATETIME,
    "deliverySlot" TEXT,
    "isMaterialDelivery" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- OrderItem
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "capacity" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Ticket
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ticket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- TicketImage
CREATE TABLE "TicketImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TicketImage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- TicketStatusHistory
CREATE TABLE "TicketStatusHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "imagesJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    CONSTRAINT "TicketStatusHistory_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TicketStatusHistory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- OrderStatusHistory
CREATE TABLE "OrderStatusHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "imagesJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderStatusHistory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- UserProduct
CREATE TABLE "UserProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Referral
CREATE TABLE "Referral" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "referrerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "tokensAwarded" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Token
CREATE TABLE "Token" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNUSED',
    "userId" TEXT NOT NULL,
    "adminId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" DATETIME,
    CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Token_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Indexes
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "TicketImage_ticketId_idx" ON "TicketImage"("ticketId");
CREATE INDEX "TicketStatusHistory_ticketId_idx" ON "TicketStatusHistory"("ticketId");
CREATE INDEX "TicketStatusHistory_createdById_idx" ON "TicketStatusHistory"("createdById");
CREATE INDEX "OrderStatusHistory_orderId_idx" ON "OrderStatusHistory"("orderId");
CREATE INDEX "OrderStatusHistory_createdById_idx" ON "OrderStatusHistory"("createdById");
CREATE UNIQUE INDEX "UserProduct_userId_productId_key" ON "UserProduct"("userId", "productId");
CREATE UNIQUE INDEX "Referral_phone_key" ON "Referral"("phone");
