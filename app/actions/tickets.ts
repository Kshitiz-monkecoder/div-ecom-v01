"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requireAuth, requireAdmin } from "@/lib/proxy";
import { TicketStatus } from "@prisma/client";
import { z } from "zod";

const createTicketSchema = z.object({
  category: z.enum(["Installation Issue", "Product Issue", "Billing / Payment", "General Query"]),
  description: z.string().min(1),
  orderId: z.string().optional(),
});

export async function createTicket(data: unknown) {
  const user = await requireAuth();

  const validated = createTicketSchema.parse(data);

  // If orderId is provided, verify it belongs to the user
  if (validated.orderId) {
    const order = await prisma.order.findUnique({
      where: { id: validated.orderId },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.userId !== user.id) {
      throw new Error("Order does not belong to you");
    }
  }

  const ticket = await prisma.ticket.create({
    data: {
      userId: user.id,
      orderId: validated.orderId,
      category: validated.category,
      description: validated.description,
      status: "OPEN",
    },
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
  });

  return ticket;
}

export async function getUserTickets() {
  const user = await requireAuth();

  const tickets = await prisma.ticket.findMany({
    where: { userId: user.id },
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
  });

  return tickets;
}

export async function getTicket(id: string) {
  if (!id) {
    throw new Error("Ticket ID is required");
  }

  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id },
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
  });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  // Users can only see their own tickets, admins can see all
  if (ticket.userId !== user.id && user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return ticket;
}

export async function getAllTickets(status?: TicketStatus) {
  await requireAdmin();

  const tickets = await prisma.ticket.findMany({
    where: status ? { status } : undefined,
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
  });

  return tickets;
}

export async function updateTicketStatus(id: string, status: TicketStatus) {
  if (!id) {
    throw new Error("Ticket ID is required");
  }

  await requireAdmin();

  const ticket = await prisma.ticket.update({
    where: { id },
    data: { status },
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
  });

  return ticket;
}

