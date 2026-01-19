"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requireAdmin } from "@/lib/proxy";
import { parseImages, stringifyImages } from "@/lib/product-helpers";
import { uploadImage } from "@/lib/cloudinary";
import { z } from "zod";
import { Role } from "@prisma/client";

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().positive(),
  capacity: z.string().min(1),
  category: z.enum(["Residential", "Commercial"]),
  images: z.array(z.string().url()),
  isActive: z.boolean().optional(),
});

export async function getProducts(category?: string) {
  const user = await getCurrentUser();

  // If user is admin, show all active products
  if (user?.role === Role.ADMIN) {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return products.map((product) => ({
      ...product,
      images: parseImages(product.images),
    }));
  }

  // If user is logged in (regular user), show only assigned products
  if (user) {
    const userProducts = await prisma.userProduct.findMany({
      where: { userId: user.id },
      include: {
        product: true,
      },
    });

    let products = userProducts
      .map((up) => up.product)
      .filter((p) => p.isActive === true);

    // Filter by category if specified
    if (category) {
      products = products.filter((p) => p.category === category);
    }

    return products.map((product) => ({
      ...product,
      images: parseImages(product.images),
    }));
  }

  // If not logged in, return empty array
  return [];
}

export async function getProduct(id: string) {
  if (!id) {
    return null;
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      orderItems: {
        take: 5,
        include: {
          order: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) return null;

  // Convert images JSON string to array
  return {
    ...product,
    images: parseImages(product.images),
  };
}

export async function getAllProducts() {
  await requireAdmin();

  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  // Convert images JSON string to array
  return products.map((product) => ({
    ...product,
    images: parseImages(product.images),
  }));
}

export async function createProduct(data: unknown) {
  await requireAdmin();

  const validated = productSchema.parse(data);

  const product = await prisma.product.create({
    data: {
      name: validated.name,
      description: validated.description,
      price: validated.price,
      capacity: validated.capacity,
      category: validated.category,
      images: stringifyImages(validated.images),
      isActive: validated.isActive ?? true,
    },
  });

  return {
    ...product,
    images: parseImages(product.images),
  };
}

export async function updateProduct(id: string, data: unknown) {
  if (!id) {
    throw new Error("Product ID is required");
  }

  await requireAdmin();

  const validated = productSchema.partial().parse(data);

  const updateData: any = { ...validated };
  if (validated.images) {
    updateData.images = stringifyImages(validated.images);
  }

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
  });

  return {
    ...product,
    images: parseImages(product.images),
  };
}

export async function toggleProductStatus(id: string) {
  if (!id) {
    throw new Error("Product ID is required");
  }

  await requireAdmin();

  const product = await prisma.product.findUnique({
    where: { id },
    select: { isActive: true },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { isActive: !product.isActive },
  });

  return updated;
}

export async function deleteProduct(id: string) {
  if (!id) {
    throw new Error("Product ID is required");
  }

  await requireAdmin();

  await prisma.product.delete({
    where: { id },
  });
}

export async function uploadProductImages(formData: FormData): Promise<string[]> {
  await requireAdmin();

  const files = formData.getAll("images") as File[];
  
  if (files.length === 0) {
    throw new Error("No files provided");
  }

  const uploadPromises = files.map((file) => uploadImage(file));
  const urls = await Promise.all(uploadPromises);
  
  return urls;
}

