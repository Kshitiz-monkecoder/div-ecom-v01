import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateReferralCode } from "@/lib/referral";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In the schema this is required, but keep this safe for older DB rows.
    if (user.referralCode) {
      return NextResponse.json({ code: user.referralCode });
    }

    for (let attempt = 0; attempt < 10; attempt++) {
      const code = generateReferralCode();
      try {
        const updated = await prisma.user.update({
          where: { id: user.id },
          data: { referralCode: code },
          select: { referralCode: true },
        });
        return NextResponse.json({ code: updated.referralCode });
      } catch (err: any) {
        // Unique constraint collision (extremely rare, but retry).
        if (err?.code === "P2002") continue;
        throw err;
      }
    }

    return NextResponse.json(
      { error: "Failed to generate referral code" },
      { status: 500 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch referral code" },
      { status: 500 }
    );
  }
}
