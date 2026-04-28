import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Role, type User } from "@/types";

/**
 * Layout-level auth guards (server components).
 * These redirect instead of throwing, so layouts/pages can protect routes cleanly.
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  if (user.role !== Role.ADMIN) {
    redirect("/orders");
  }
  return user;
}
