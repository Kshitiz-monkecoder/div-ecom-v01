import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "auth_session";

export async function GET() {
  try {
const cookieStore = await cookies();

    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    //  FIX: explicit check (removes TS red line)
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);

    const tokens = await prisma.token.findMany({
      where: {
        userId: session.userId,
      },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tokens);
  } catch (error) {
    console.error("User tokens error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}
