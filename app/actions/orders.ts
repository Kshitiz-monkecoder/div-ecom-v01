"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin, getCurrentUser } from "@/lib/auth";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";

const createOrderSchema = z.object({
  productId: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  notes: z.string().optional(),
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

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      productId: validated.productId,
      address: validated.address,
      phone: validated.phone,
      notes: validated.notes,
      status: "NEW",
    },
    include: {
      product: true,
    },
  });

  return order;
}

export async function getUserOrders() {
  const user = await requireAuth();

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      product: true,
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
      product: true,
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
      product: true,
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
      product: true,
      user: true,
    },
  });

  return order;
}

