"use server";

import { getCurrentUser } from "@/lib/auth";
import { requireAuth, requireAdmin } from "@/lib/proxy";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { uploadDocument, uploadMultipleFiles } from "@/lib/cloudinary";
import { divyEngineFetch } from "@/lib/divy-engine-api";

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
  date: z
    .union([z.string(), z.date()])
    .optional()
    .transform((v) => (v ? (typeof v === "string" ? new Date(v) : v) : undefined)),
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

  const order = await divyEngineFetch<any>("/api/ecom/orders", {
    method: "POST",
    actor: { id: user.id, role: user.role },
    body: JSON.stringify(validated),
  });

  return order;
}

export async function getUserOrders() {
  const user = await requireAuth();

  return divyEngineFetch<any[]>("/api/ecom/orders", {
    actor: { id: user.id, role: user.role },
  });
}

export async function getOrder(id: string) {
  if (!id) {
    throw new Error("Order ID is required");
  }

  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  return divyEngineFetch<any>(`/api/ecom/orders/${id}`, {
    actor: { id: user.id, role: user.role },
  });
}

export async function getAllOrders(status?: OrderStatus) {
  const admin = await requireAdmin();

  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return divyEngineFetch<any[]>(`/api/ecom/admin/orders${query}`, {
    actor: { id: admin.id, role: admin.role },
  });
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

  return divyEngineFetch<any>(`/api/ecom/admin/orders/${id}/status`, {
    method: "PATCH",
    actor: { id: admin.id, role: admin.role },
    body: JSON.stringify({ status, note, imageUrls }),
  });
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

  await divyEngineFetch<{ success: true }>(`/api/ecom/orders/${orderId}/delivery-slot`, {
    method: "PATCH",
    actor: { id: user.id, role: user.role },
    body: JSON.stringify({ deliveryDate, deliverySlot }),
  });

  return { success: true };
}

export async function updateOrderMaterialDelivery(orderId: string, isMaterialDelivery: boolean) {
  if (!orderId) {
    throw new Error("Order ID is required");
  }

  const admin = await requireAdmin();

  await divyEngineFetch<{ success: true }>(`/api/ecom/admin/orders/${orderId}/material-delivery`, {
    method: "PATCH",
    actor: { id: admin.id, role: admin.role },
    body: JSON.stringify({ isMaterialDelivery }),
  });

  return { success: true };
}

export async function createAdminOrder(data: unknown) {
  const admin = await requireAdmin();
  const validated = createAdminOrderSchema.parse(data);

  const order = await divyEngineFetch<any>("/api/ecom/admin/orders", {
    method: "POST",
    actor: { id: admin.id, role: admin.role },
    body: JSON.stringify(validated),
  });

  return order;
}

export async function uploadOrderDocument(
  file: File,
  orderId: string,
  type: "warranty" | "invoice" | "additional"
): Promise<string> {
  const admin = await requireAdmin();

  if (!orderId) {
    throw new Error("Order ID is required");
  }

  const folder = `order-documents/${orderId}`;
  const url = await uploadDocument(file, folder);

  await divyEngineFetch<{ success: true }>(`/api/ecom/admin/orders/${orderId}/documents`, {
    method: "PATCH",
    actor: { id: admin.id, role: admin.role },
    body: JSON.stringify({ type, url }),
  });

  return url;
}

export async function uploadOrderAdditionalFiles(files: File[], orderId: string): Promise<string[]> {
  const admin = await requireAdmin();

  if (!orderId) {
    throw new Error("Order ID is required");
  }

  const folder = `order-documents/${orderId}/additional`;
  const urls = await uploadMultipleFiles(files, folder, "raw");

  await divyEngineFetch<{ success: true }>(`/api/ecom/admin/orders/${orderId}/documents`, {
    method: "PATCH",
    actor: { id: admin.id, role: admin.role },
    body: JSON.stringify({ type: "additional", urls }),
  });

  return urls;
}
