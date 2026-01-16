import { prisma } from "./prisma";

/**
 * Generate a unique order number in the format ORD-YYYY-XXX
 * where YYYY is the current year and XXX is a sequential number (001, 002, etc.)
 * 
 * @returns Promise resolving to a unique order number string
 */
export async function generateOrderNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `ORD-${currentYear}-`;

  // Find the last order number for the current year
  const lastOrder = await prisma.order.findFirst({
    where: {
      orderNumber: {
        startsWith: yearPrefix,
      },
    },
    orderBy: {
      orderNumber: "desc",
    },
  });

  let sequenceNumber = 1;

  if (lastOrder) {
    // Extract the sequence number from the last order
    const lastSequence = lastOrder.orderNumber.replace(yearPrefix, "");
    const parsed = parseInt(lastSequence, 10);
    if (!isNaN(parsed)) {
      sequenceNumber = parsed + 1;
    }
  }

  // Format with leading zeros (001, 002, etc.)
  const formattedSequence = sequenceNumber.toString().padStart(3, "0");
  const orderNumber = `${yearPrefix}${formattedSequence}`;

  // Double-check uniqueness (in case of race conditions)
  const existing = await prisma.order.findUnique({
    where: { orderNumber },
  });

  if (existing) {
    // If somehow the number exists, try the next one
    return generateOrderNumber();
  }

  return orderNumber;
}
