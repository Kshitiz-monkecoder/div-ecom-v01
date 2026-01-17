import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "auth_session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);

    // Fetch current user's referral code
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { referralCode: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ code: user.referralCode });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch referral code" }, { status: 500 });
  }
}
