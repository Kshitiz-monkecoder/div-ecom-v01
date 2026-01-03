import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  return userId;
}

export async function requireAdmin() {
  const userId = await requireAuth();
  
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { role: true },
  });

  if (!user || user.role !== Role.ADMIN) {
    redirect("/");
  }

  return userId;
}

