import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  // Sync user from Clerk to database
  const user = await prisma.user.upsert({
    where: { clerkUserId: userId },
    update: {
      name: clerkUser.firstName && clerkUser.lastName
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser.firstName || clerkUser.lastName || clerkUser.emailAddresses[0]?.emailAddress || "User",
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
    },
    create: {
      clerkUserId: userId,
      name: clerkUser.firstName && clerkUser.lastName
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser.firstName || clerkUser.lastName || clerkUser.emailAddresses[0]?.emailAddress || "User",
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
      role: Role.USER,
    },
  });

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== Role.ADMIN) {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === Role.ADMIN;
}

