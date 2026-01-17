import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "auth_session";

interface SessionData {
  userId: string;
  referralCode?: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session: SessionData = JSON.parse(sessionCookie.value);

    const referrals = await prisma.referral.findMany({
      where: {
        referralCode: session.referralCode, // or userId: session.userId
      },
      select: {
        id: true,
        name: true,
        product: true,
        status: true,
        submittedAt: true,
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json(referrals);
  } catch (error) {
    console.error("User referrals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch referrals" },
      { status: 500 }
    );
  }
}
