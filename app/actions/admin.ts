"use server";

import { requireAdmin } from "@/lib/proxy";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function getDashboardStats() {
  const admin = await requireAdmin();

  return divyEngineFetch<{
    totalOrders: number;
    openTickets: number;
    recentOrders: any[];
    recentTickets: any[];
  }>("/api/ecom/admin/dashboard", {
    actor: { id: admin.id, role: admin.role },
  });
}

export async function getAllUsers() {
  const admin = await requireAdmin();

  return divyEngineFetch<any[]>("/api/ecom/admin/users", {
    actor: { id: admin.id, role: admin.role },
  });
}

export async function getUserDetails(id: string) {
  const admin = await requireAdmin();

  if (!id) {
    throw new Error("User ID is required");
  }

  return divyEngineFetch<any>(`/api/ecom/admin/users/${id}`, {
    actor: { id: admin.id, role: admin.role },
  });
}

export async function createUser(data: {
  name: string;
  phone: string;
  email?: string;
}) {
  const admin = await requireAdmin();

  const cleanPhone = data.phone.replace(/\D/g, "");
  if (cleanPhone.length !== 10) {
    throw new Error("Phone number must be 10 digits");
  }

  return divyEngineFetch<any>("/api/ecom/admin/users", {
    method: "POST",
    actor: { id: admin.id, role: admin.role },
    body: JSON.stringify({
      name: data.name,
      phone: cleanPhone,
      email: data.email || null,
    }),
  });
}

export async function assignProductsToUser(userId: string, productIds: string[]) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const admin = await requireAdmin();

  await divyEngineFetch<{ success: true }>(`/api/ecom/admin/users/${userId}/assign-products`, {
    method: "POST",
    actor: { id: admin.id, role: admin.role },
    body: JSON.stringify({ productIds }),
  });

  return { success: true };
}

export async function getUserAssignedProducts(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const admin = await requireAdmin();

  return divyEngineFetch<any[]>(`/api/ecom/admin/users/${userId}/assigned-products`, {
    actor: { id: admin.id, role: admin.role },
  });
}

export async function getAllProducts() {
  const admin = await requireAdmin();

  return divyEngineFetch<any[]>("/api/ecom/admin/products", {
    actor: { id: admin.id, role: admin.role },
  });
}

export async function getAllProductUserAssignments() {
  const admin = await requireAdmin();

  const [products, users] = await Promise.all([
    divyEngineFetch<any[]>("/api/ecom/admin/products", {
      actor: { id: admin.id, role: admin.role },
    }),
    divyEngineFetch<any[]>("/api/ecom/admin/users", {
      actor: { id: admin.id, role: admin.role },
    }),
  ]);

  const userMap = new Map(users.map((user) => [user.id, user]));
  const assignments: any[] = [];

  for (const product of products) {
    const assignedUsers = await divyEngineFetch<any[]>(
      `/api/ecom/admin/products/${product.id}/assigned-users`,
      {
        actor: { id: admin.id, role: admin.role },
      }
    );

    for (const user of assignedUsers) {
      assignments.push({
        id: `${user.id}-${product.id}`,
        createdAt: new Date().toISOString(),
        user: userMap.get(user.id) || user,
        product,
      });
    }
  }

  return assignments;
}

export async function assignProductToUsers(productId: string, userIds: string[]) {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  const admin = await requireAdmin();

  await divyEngineFetch<{ success: true }>(`/api/ecom/admin/products/${productId}/assign-users`, {
    method: "POST",
    actor: { id: admin.id, role: admin.role },
    body: JSON.stringify({ userIds }),
  });

  return { success: true };
}

export async function getProductAssignedUsers(productId: string) {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  const admin = await requireAdmin();

  return divyEngineFetch<any[]>(`/api/ecom/admin/products/${productId}/assigned-users`, {
    actor: { id: admin.id, role: admin.role },
  });
}

export async function getAllUsersForAssignment() {
  const admin = await requireAdmin();

  return divyEngineFetch<any[]>("/api/ecom/admin/users-for-assignment", {
    actor: { id: admin.id, role: admin.role },
  });
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

  const admin = await requireAdmin();

  return divyEngineFetch<any>(`/api/ecom/admin/users/${userId}`, {
    method: "PATCH",
    actor: { id: admin.id, role: admin.role },
    body: JSON.stringify(data),
  });
}

export async function deleteUser(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const admin = await requireAdmin();

  await divyEngineFetch<{ success: true }>(`/api/ecom/admin/users/${userId}`, {
    method: "DELETE",
    actor: { id: admin.id, role: admin.role },
  });

  return { success: true };
}
