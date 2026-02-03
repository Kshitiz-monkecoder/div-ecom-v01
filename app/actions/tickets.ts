"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requireAuth, requireAdmin } from "@/lib/proxy";
import { TicketStatus } from "@prisma/client";
import { z } from "zod";

const createTicketSchema = z.object({
  category: z.enum(["Installation Issue", "Product Issue", "Billing / Payment", "General Query"]),
  description: z.string().min(100),
  orderId: z.string().min(1, "Related order is required"),
  images: z.array(z.string().url()).min(1),
});

export async function createTicket(data: unknown) {
  const user = await requireAuth();

  const validated = createTicketSchema.parse(data);

  // Verify order belongs to the user
  const order = await prisma.order.findUnique({
    where: { id: validated.orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.userId !== user.id) {
    throw new Error("Order does not belong to you");
  }

  const ticket = await prisma.ticket.create({
    data: {
      userId: user.id,
      orderId: validated.orderId,
      category: validated.category,
      description: validated.description,
      status: "OPEN",
      images: {
        create: validated.images.map((url) => ({ url })),
      },
      statusHistory: {
        create: {
          status: "OPEN",
          createdById: user.id,
        },
      },
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
      images: true,
      statusHistory: {
        orderBy: { createdAt: "asc" },
        include: { createdBy: true },
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
      images: true,
      statusHistory: {
        orderBy: { createdAt: "asc" },
        include: { createdBy: true },
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

  const ticket = await prisma.ticket.update({
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
      images: true,
      statusHistory: {
        orderBy: { createdAt: "asc" },
        include: { createdBy: true },
      },
    },
  });

  return ticket;
}

