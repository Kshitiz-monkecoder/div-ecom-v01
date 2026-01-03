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
        product: true,
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
            product: true,
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

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          product: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      tickets: {
        include: {
          order: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return user;
}

