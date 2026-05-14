"use server";

import { getCurrentUser } from "@/lib/auth";
import { requireAuth, requireAdmin } from "@/lib/proxy";
import { z } from "zod";
import { divyEngineFetch } from "@/lib/divy-engine-api";
import { type TicketStatus } from "@/types";

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

  const CATEGORY_MAPPING: Record<string, string> = {
    "Installation Issue": "Plant On",
    "Product Issue": "DG BreakDown",
    "Billing / Payment": "INC",
    "General Query": "BOM Visit",
  };

  const mappedCategory =
    CATEGORY_MAPPING[validated.category] ?? validated.category;

  return divyEngineFetch<any>("/api/ecom/tickets", {
    method: "POST",
    actor: { id: user.id, role: user.role },
    body: JSON.stringify({
      ...validated,
      category: mappedCategory,
    }),
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

  console.log('getTicket called', { id, userId: user.id, userRole: user.role });

  try {
    const result = await divyEngineFetch<any>(`/api/ecom/tickets/${id}`, {
      actor: { id: user.id, role: user.role },
    });
    console.log('getTicket success', result);
    return result;
  } catch (err) {
    console.error('getTicket error', err);
    throw err;
  }
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

export async function sendAdminReply(ticketId: string, message: string, imageUrls?: string[]) {
  if (!ticketId) throw new Error("Ticket ID is required");
  if (!message?.trim()) throw new Error("Message cannot be empty");

  const admin = await requireAdmin();

  return divyEngineFetch<any>(`/api/ecom/admin/tickets/${ticketId}/messages`, {
    method: "POST",
    actor: { id: admin.id, role: admin.role },
    body: JSON.stringify({ message: message.trim(), imageUrls: imageUrls ?? [] }),
  });
}

export async function sendCustomerMessage(ticketId: string, message: string) {
  if (!ticketId) throw new Error("Ticket ID is required");
  if (!message?.trim()) throw new Error("Message cannot be empty");

  const user = await requireAuth();

  return divyEngineFetch<any>(`/api/ecom/tickets/${ticketId}/messages`, {
    method: "POST",
    actor: { id: user.id, role: user.role },
    body: JSON.stringify({ message: message.trim() }),
  });
}

export async function getTicketMessages(ticketId: string) {
  if (!ticketId) throw new Error("Ticket ID is required");

  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  return divyEngineFetch<any[]>(`/api/ecom/tickets/${ticketId}/messages`, {
    actor: { id: user.id, role: user.role },
  });
}
