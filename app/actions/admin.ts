"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function getDashboardStats() {
  await requireAdmin();

  const [totalOrders, openTickets, recentOrders, recentTickets] = await Promise.all([
    prisma.order.count(),
    prisma.ticket.count({
      where: {
        status: {
          in: ["OPEN", "IN_PROGRESS"],
        },
      },
    }),
    prisma.order.findMany({
      take: 10,
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
    }),
    prisma.ticket.findMany({
      take: 10,
      include: {
        user: true,
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    totalOrders,
    openTickets,
    recentOrders,
    recentTickets,
  };
}

export async function getAllUsers() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          orders: true,
          tickets: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
}

export async function getUserDetails(id: string) {
  await requireAdmin();

  if (!id) {
    throw new Error("User ID is required");
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      tickets: {
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      products: {
        include: {
          product: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return user;
}

export async function createUser(data: {
  name: string;
  phone: string;
  email?: string;
}) {
  await requireAdmin();

  // Clean phone number
  const cleanPhone = data.phone.replace(/\D/g, "");

  if (cleanPhone.length !== 10) {
    throw new Error("Phone number must be 10 digits");
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { phone: cleanPhone },
  });

  if (existingUser) {
    throw new Error("User with this phone number already exists");
  }

  const user = await prisma.user.create({
    data: {
      name: data.name,
      phone: cleanPhone,
      email: data.email || null,
      role: "USER",
    },
  });

  return user;
}

export async function assignProductsToUser(userId: string, productIds: string[]) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  await requireAdmin();

  // Remove existing assignments
  await prisma.userProduct.deleteMany({
    where: { userId },
  });

  // Create new assignments
  if (productIds.length > 0) {
    await prisma.userProduct.createMany({
      data: productIds.map((productId) => ({
        userId,
        productId,
      })),
    });
  }

  return { success: true };
}

export async function getUserAssignedProducts(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  await requireAdmin();

  const userProducts = await prisma.userProduct.findMany({
    where: { userId },
    include: {
      product: true,
    },
  });

  return userProducts.map((up) => up.product);
}

export async function getAllProducts() {
  await requireAdmin();

  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return products;
}

export async function getAllProductUserAssignments() {
  await requireAdmin();

  const assignments = await prisma.userProduct.findMany({
    include: {
      user: true,
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return assignments;
}

export async function assignProductToUsers(productId: string, userIds: string[]) {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  await requireAdmin();

  // Remove existing assignments for this product
  await prisma.userProduct.deleteMany({
    where: { productId },
  });

  // Create new assignments
  if (userIds.length > 0) {
    await prisma.userProduct.createMany({
      data: userIds.map((userId) => ({
        userId,
        productId,
      })),
    });
  }

  return { success: true };
}

export async function getProductAssignedUsers(productId: string) {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  await requireAdmin();

  const userProducts = await prisma.userProduct.findMany({
    where: { productId },
    include: {
      user: true,
    },
  });

  return userProducts.map((up) => up.user);
}

export async function getAllUsersForAssignment() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
}

export async function updateUser(
  userId: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    role?: "USER" | "ADMIN";
  }
) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  await requireAdmin();

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  // If phone is being updated, clean it and check for duplicates
  if (data.phone !== undefined) {
    const cleanPhone = data.phone.replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      throw new Error("Phone number must be 10 digits");
    }

    // Check if phone number is already taken by another user
    const userWithPhone = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (userWithPhone && userWithPhone.id !== userId) {
      throw new Error("Phone number is already in use by another user");
    }

    data.phone = cleanPhone;
  }

  // Update the user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email || null }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.role !== undefined && { role: data.role }),
    },
  });

  return updatedUser;
}

export async function deleteUser(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const currentUser = await requireAdmin();

  // Prevent deleting yourself
  if (currentUser.id === userId) {
    throw new Error("You cannot delete your own account");
  }

  // Check if user exists and is not an admin (or allow admins to delete other admins)
  const userToDelete = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userToDelete) {
    throw new Error("User not found");
  }

  // Delete the user (cascade will handle related records)
  await prisma.user.delete({
    where: { id: userId },
  });

  return { success: true };
}

