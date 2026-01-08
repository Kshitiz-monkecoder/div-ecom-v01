import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

const SESSION_COOKIE_NAME = "auth_session";

interface SessionData {
  userId: string;
  token: string;
}

async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    
    if (!sessionCookie?.value) {
      return null;
    }

    const session = JSON.parse(sessionCookie.value) as SessionData;
    return session;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    return user;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
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

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
