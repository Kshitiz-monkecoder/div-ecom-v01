"use server";

import { getCurrentUser } from "@/lib/auth";
import { requireAdmin } from "@/lib/proxy";
import { filesToEnginePayload } from "@/lib/file-to-base64";
import { divyEngineFetch } from "@/lib/divy-engine-api";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().positive(),
  capacity: z.string().min(1),
  category: z.enum(["Residential", "Commercial"]),
  images: z.array(z.string().url()),
  isActive: z.boolean().optional(),
  sno: z.string().optional(),
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
  mobileNo: z.string().optional(),
  systemType: z.string().optional(),
  address: z.string().optional(),
  area: z.string().optional(),
  solarBrand: z.string().optional(),
});

export async function getProducts(category?: string) {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  return divyEngineFetch<any[]>(`/api/ecom/products${query}`, {
    actor: { id: user.id, role: user.role },
  });
}

export async function getProduct(id: string) {
  if (!id) {
    return null;
  }

  const user = await getCurrentUser();

  if (!user) {
    try {
      return await divyEngineFetch<any>(`/api/ecom/public/products/${id}`);
    } catch {
      return null;
    }
  }

  try {
    return await divyEngineFetch<any>(`/api/ecom/products/${id}`, {
      actor: { id: user.id, role: user.role },
    });
  } catch {
    return null;
  }
}

export async function getAllProducts() {
  const admin = await requireAdmin();

  return divyEngineFetch<any[]>("/api/ecom/admin/products", {
    actor: { id: admin.id, role: admin.role },
  });
}

export async function createProduct(data: unknown) {
  const admin = await requireAdmin();
  const validated = productSchema.parse(data);

  return divyEngineFetch<any>("/api/ecom/admin/products", {
    method: "POST",
    actor: { id: admin.id, role: admin.role },
    body: JSON.stringify(validated),
  });
}

export async function updateProduct(id: string, data: unknown) {
  if (!id) {
    throw new Error("Product ID is required");
  }

  const admin = await requireAdmin();
  const validated = productSchema.partial().parse(data);

  return divyEngineFetch<any>(`/api/ecom/admin/products/${id}`, {
    method: "PATCH",
    actor: { id: admin.id, role: admin.role },
    body: JSON.stringify(validated),
  });
}

export async function toggleProductStatus(id: string) {
  if (!id) {
    throw new Error("Product ID is required");
  }

  const admin = await requireAdmin();

  return divyEngineFetch<any>(`/api/ecom/admin/products/${id}/toggle`, {
    method: "PATCH",
    actor: { id: admin.id, role: admin.role },
  });
}

export async function deleteProduct(id: string) {
  if (!id) {
    throw new Error("Product ID is required");
  }

  const admin = await requireAdmin();

  await divyEngineFetch<{ success: true }>(`/api/ecom/admin/products/${id}`, {
    method: "DELETE",
    actor: { id: admin.id, role: admin.role },
  });
}

export async function uploadProductImages(formData: FormData): Promise<string[]> {
  const admin = await requireAdmin();

  const files = formData.getAll("images") as File[];
  if (files.length === 0) {
    throw new Error("No files provided");
  }

  const payload = await filesToEnginePayload(files);
  const response = await divyEngineFetch<{ urls: string[] }>("/api/ecom/files/upload-images", {
    method: "POST",
    actor: { id: admin.id, role: admin.role },
    body: JSON.stringify({ files: payload }),
  });

  return response.urls;
}
