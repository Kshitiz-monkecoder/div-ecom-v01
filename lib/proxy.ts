import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Role, type User } from "@/types";

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== Role.ADMIN) {
    redirect("/login");  // ← redirect instead of throw
  }
  return user;
}