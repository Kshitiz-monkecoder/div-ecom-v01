"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requireAuth, requireAdmin } from "@/lib/proxy";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { generateOrderNumber } from "@/lib/order-number";
import { uploadDocument, uploadMultipleFiles } from "@/lib/cloudinary";
import { sendOrderCreatedWhatsAppMessage } from "@/lib/whatsapp";

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
  warrantyDocumentNo: z.string().min(1).optional(),
  warrantyPdfData: z.string().min(1).optional(),
  warrantyCardUrl: z.string().url().optional(),
  invoiceUrl: z.string().url().optional(),
  additionalFiles: z.array(z.string().url()).optional(),
  isMaterialDelivery: z.boolean().optional(),
  leadNo: z.string().optional(),
  tenure: z.string().optional(),
  date: z.union([z.string(), z.date()]).optional().transform((v) => (v ? (typeof v === "string" ? new Date(v) : v) : undefined)),
  customerCompanyName: z.string().optional(),
  segmentProductType: z.string().optional(),
  kWp: z.string().optional(),
  structure: z.string().optional(),
  inverter: z.string().optional(),
  systemType: z.string().optional(),
  area: z.string().optional(),
  solarBrand: z.string().optional(),
});

const VALID_DELIVERY_SLOTS = ["EARLY", "MID", "LATE", "NIGHT"] as const;

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
      statusHistory: {
        create: {
          status: "NEW",
          createdById: user.id,
        },
      },
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
      statusHistory: {
        orderBy: { createdAt: "asc" },
        include: { createdBy: true },
      },
    },
  });

  // Fire-and-forget WhatsApp message (don't fail order creation if WhatsApp is down)
  try {
    await sendOrderCreatedWhatsAppMessage({
      mobileNo: validated.phone,
    });
  } catch (error) {
    console.error("Failed to send order WhatsApp message:", error);
  }

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
      statusHistory: {
        orderBy: { createdAt: "asc" },
        include: { createdBy: true },
      },
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

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  note?: string,
  imageUrls?: string[]
) {
  if (!id) {
    throw new Error("Order ID is required");
  }

  const admin = await requireAdmin();

  const order = await prisma.order.update({
    where: { id },
    data: {
      status,
      statusHistory: {
        create: {
          status,
          note: note?.trim() ? note.trim() : undefined,
          imagesJson:
            imageUrls && imageUrls.length > 0 ? JSON.stringify(imageUrls) : undefined,
          createdById: admin.id,
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
      statusHistory: {
        orderBy: { createdAt: "asc" },
        include: { createdBy: true },
      },
    },
  });

  return order;
}

export async function updateOrderDeliverySlot(
  orderId: string,
  deliveryDate: Date,
  deliverySlot: string
) {
  if (!orderId) {
    throw new Error("Order ID is required");
  }

  const user = await requireAuth();

  if (!VALID_DELIVERY_SLOTS.includes(deliverySlot as (typeof VALID_DELIVERY_SLOTS)[number])) {
    throw new Error("Invalid delivery slot");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.userId !== user.id) {
    throw new Error("Order does not belong to you");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const slotDate = new Date(deliveryDate);
  slotDate.setHours(0, 0, 0, 0);
  if (slotDate < today) {
    throw new Error("Delivery date must be today or in the future");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      deliveryDate: slotDate,
      deliverySlot,
    },
  });

  return { success: true };
}

export async function updateOrderMaterialDelivery(
  orderId: string,
  isMaterialDelivery: boolean
) {
  if (!orderId) {
    throw new Error("Order ID is required");
  }

  await requireAdmin();

  await prisma.order.update({
    where: { id: orderId },
    data: { isMaterialDelivery },
  });

  return { success: true };
}

/**
 * Create an order as admin with multiple products and document uploads
 */
export async function createAdminOrder(data: unknown) {
  const admin = await requireAdmin();

  const validated = createAdminOrderSchema.parse(data);

  // If the DB schema hasn't been migrated yet, Prisma will throw
  // "Unknown argument warrantyDocumentNo/warrantyPdfData". Detect and only set
  // these fields if the columns exist.
  let orderHasWarrantyColumns = false;
  try {
    const cols = (await prisma.$queryRawUnsafe(`PRAGMA table_info("Order")`)) as Array<{
      name?: string;
    }>;
    const names = new Set(cols.map((c) => c.name).filter(Boolean) as string[]);
    orderHasWarrantyColumns =
      names.has("warrantyDocumentNo") && names.has("warrantyPdfData");
  } catch {
    // If PRAGMA isn't supported by the adapter, fail open by not setting new fields.
    orderHasWarrantyColumns = false;
  }

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
  // NOTE: These fields are added to the Prisma schema via migration.
  // If Prisma Client hasn't been regenerated yet, TypeScript won't know about them.
  // We build the `data` object dynamically to keep typechecking unblocked.
  const orderData: any = {
    userId: validated.userId,
    orderNumber,
    address: validated.address,
    phone: validated.phone,
    notes: validated.notes,
    warrantyCardUrl: validated.warrantyCardUrl,
    invoiceUrl: validated.invoiceUrl,
    additionalFiles: validated.additionalFiles ? JSON.stringify(validated.additionalFiles) : null,
    isMaterialDelivery: validated.isMaterialDelivery ?? false,
    leadNo: validated.leadNo,
    tenure: validated.tenure,
    date: validated.date,
    customerCompanyName: validated.customerCompanyName,
    segmentProductType: validated.segmentProductType,
    kWp: validated.kWp,
    structure: validated.structure,
    inverter: validated.inverter,
    systemType: validated.systemType,
    area: validated.area,
    solarBrand: validated.solarBrand,
    status: "NEW",
    statusHistory: {
      create: {
        status: "NEW",
        createdById: admin.id,
      },
    },
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
  };

  if (validated.warrantyDocumentNo) {
    if (orderHasWarrantyColumns) {
      orderData.warrantyDocumentNo = validated.warrantyDocumentNo;
    }
  }

  if (validated.warrantyPdfData) {
    if (orderHasWarrantyColumns) {
      orderData.warrantyPdfData = validated.warrantyPdfData;
    }
  }

  const order = await prisma.order.create({
    data: {
      ...orderData,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: true,
      statusHistory: {
        orderBy: { createdAt: "asc" },
        include: { createdBy: true },
      },
    },
  });

  // Fire-and-forget WhatsApp message (don't fail order creation if WhatsApp is down)
  try {
    await sendOrderCreatedWhatsAppMessage({
      mobileNo: validated.phone,
    });
  } catch (error) {
    console.error("Failed to send admin order WhatsApp message:", error);
  }

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
