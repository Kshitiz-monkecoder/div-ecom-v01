"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requireAuth, requireAdmin } from "@/lib/proxy";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { generateOrderNumber } from "@/lib/order-number";
import { uploadDocument, uploadMultipleFiles } from "@/lib/cloudinary";

const createOrderSchema = z.object({
  productId: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  notes: z.string().optional(),
});

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  unitPrice: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string().min(1),
  capacity: z.string().min(1),
});

const createAdminOrderSchema = z.object({
  userId: z.string().min(1),
  items: z.array(orderItemSchema).min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  notes: z.string().optional(),
  warrantyCardUrl: z.string().url().optional(),
  invoiceUrl: z.string().url().optional(),
  additionalFiles: z.array(z.string().url()).optional(),
});

export async function createOrder(data: unknown) {
  const user = await requireAuth();

  const validated = createOrderSchema.parse(data);

  // Verify product exists and is active
  const product = await prisma.product.findUnique({
    where: { id: validated.productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (!product.isActive) {
    throw new Error("Product is not available");
  }

  const orderNumber = await generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      orderNumber,
      address: validated.address,
      phone: validated.phone,
      notes: validated.notes,
      status: "NEW",
      items: {
        create: {
          productId: validated.productId,
          quantity: 1,
          unitPrice: product.price,
          name: product.name,
          description: product.description,
          capacity: product.capacity,
        },
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: true,
    },
  });

  return order;
}

export async function getUserOrders() {
  const user = await requireAuth();

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
}

export async function getOrder(id: string) {
  if (!id) {
    throw new Error("Order ID is required");
  }

  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: true,
      tickets: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Users can only see their own orders, admins can see all
  if (order.userId !== user.id && user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return order;
}

export async function getAllOrders(status?: OrderStatus) {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  if (!id) {
    throw new Error("Order ID is required");
  }

  await requireAdmin();

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: true,
    },
  });

  return order;
}

/**
 * Create an order as admin with multiple products and document uploads
 */
export async function createAdminOrder(data: unknown) {
  await requireAdmin();

  const validated = createAdminOrderSchema.parse(data);

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: validated.userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Verify all products exist
  for (const item of validated.items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }
  }

  const orderNumber = await generateOrderNumber();

  // Create order with items
  const order = await prisma.order.create({
    data: {
      userId: validated.userId,
      orderNumber,
      address: validated.address,
      phone: validated.phone,
      notes: validated.notes,
      warrantyCardUrl: validated.warrantyCardUrl,
      invoiceUrl: validated.invoiceUrl,
      additionalFiles: validated.additionalFiles ? JSON.stringify(validated.additionalFiles) : null,
      status: "NEW",
      items: {
        create: validated.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          name: item.name,
          description: item.description,
          capacity: item.capacity,
        })),
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: true,
    },
  });

  return order;
}

/**
 * Upload order document (warranty card, invoice, or additional files)
 */
export async function uploadOrderDocument(
  file: File,
  orderId: string,
  type: "warranty" | "invoice" | "additional"
): Promise<string> {
  await requireAdmin();

  if (!orderId) {
    throw new Error("Order ID is required");
  }

  const folder = `order-documents/${orderId}`;
  const url = await uploadDocument(file, folder);

  // Update order with the document URL
  if (type === "warranty") {
    await prisma.order.update({
      where: { id: orderId },
      data: { warrantyCardUrl: url },
    });
  } else if (type === "invoice") {
    await prisma.order.update({
      where: { id: orderId },
      data: { invoiceUrl: url },
    });
  } else {
    // For additional files, append to the array
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { additionalFiles: true },
    });

    const existingFiles = order?.additionalFiles ? JSON.parse(order.additionalFiles) : [];
    const updatedFiles = [...existingFiles, url];

    await prisma.order.update({
      where: { id: orderId },
      data: { additionalFiles: JSON.stringify(updatedFiles) },
    });
  }

  return url;
}

/**
 * Upload multiple additional files for an order
 */
export async function uploadOrderAdditionalFiles(
  files: File[],
  orderId: string
): Promise<string[]> {
  await requireAdmin();

  if (!orderId) {
    throw new Error("Order ID is required");
  }

  const folder = `order-documents/${orderId}/additional`;
  const urls = await uploadMultipleFiles(files, folder, "raw");

  // Update order with the new file URLs
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { additionalFiles: true },
  });

  const existingFiles = order?.additionalFiles ? JSON.parse(order.additionalFiles) : [];
  const updatedFiles = [...existingFiles, ...urls];

  await prisma.order.update({
    where: { id: orderId },
    data: { additionalFiles: JSON.stringify(updatedFiles) },
  });

  return urls;
}
