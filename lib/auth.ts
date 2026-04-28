import { cookies } from "next/headers";
import { Role, type User } from "@prisma/client";
import { divyEngineFetch } from "@/lib/divy-engine-api";
import { cache } from "react";

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

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) return null;

  const session = parseSessionCookie(sessionCookie.value);
  if (!session) return null;

  try {
    const user = await divyEngineFetch<User>("/api/ecom/auth/me", {
      actor: {
        id: session.userId,
        role: "USER",
      },
    });
    return user;
  } catch {
    return null;
  }
});

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
