import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";
import { getCurrentUser } from "./auth";

export async function requireAuth(){
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== Role.ADMIN) {
    redirect("/orders");
  }

  return user;
}
