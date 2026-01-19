import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Role, type User } from "@prisma/client";

const SESSION_COOKIE_NAME = "auth_session";

type SessionCookie = {
  userId: string;
  token?: string;
};

function parseSessionCookie(value: string): SessionCookie | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "userId" in parsed &&
      typeof (parsed as any).userId === "string"
    ) {
      return parsed as SessionCookie;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) return null;

  const session = parseSessionCookie(sessionCookie.value);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  return user;
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  if (user.role !== Role.ADMIN) {
    throw new Error("Forbidden");
  }
  return user;
}

