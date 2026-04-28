"use server";

import { getCurrentUser } from "@/lib/auth";
import { requireAuth, requireAdmin } from "@/lib/proxy";
import { TicketStatus } from "@prisma/client";
import { z } from "zod";
import { divyEngineFetch } from "@/lib/divy-engine-api";

const createTicketSchema = z.object({
  category: z.enum(["Installation Issue", "Product Issue", "Billing / Payment", "General Query"]),
  description: z.string().min(100),
  orderId: z.string().min(1, "Related order is required"),
  images: z.array(z.string().url()).min(1),
  subCategories: z.array(z.string()).min(1, "Please select at least one sub-issue"),
});

export async function createTicket(data: unknown) {
  const user = await requireAuth();
  const validated = createTicketSchema.parse(data);

  return divyEngineFetch<any>("/api/ecom/tickets", {
    method: "POST",
    actor: { id: user.id, role: user.role },
    body: JSON.stringify(validated),
  });
}

export async function getUserTickets() {
  const user = await requireAuth();

  return divyEngineFetch<any[]>("/api/ecom/tickets", {
    actor: { id: user.id, role: user.role },
  });
}

export async function getTicket(id: string) {
  if (!id) {
    throw new Error("Ticket ID is required");
  }

  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  return divyEngineFetch<any>(`/api/ecom/tickets/${id}`, {
    actor: { id: user.id, role: user.role },
  });
}

export async function getAllTickets(status?: TicketStatus) {
  const admin = await requireAdmin();

  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return divyEngineFetch<any[]>(`/api/ecom/admin/tickets${query}`, {
    actor: { id: admin.id, role: admin.role },
  });
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus,
  note?: string,
  imageUrls?: string[]
) {
  if (!id) {
    throw new Error("Ticket ID is required");
  }

  const admin = await requireAdmin();

  return divyEngineFetch<any>(`/api/ecom/admin/tickets/${id}/status`, {
    method: "PATCH",
    actor: { id: admin.id, role: admin.role },
    body: JSON.stringify({ status, note, imageUrls }),
  });
}
