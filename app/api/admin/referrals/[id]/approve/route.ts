// app/api/admin/referrals/[id]/approve/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

interface Body {
  tokenAmount: number;
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> } // ✅ params is a Promise
) {
  try {
    const admin = await requireAdmin();

    // ✅ Await params to get the dynamic id
    const { id } = await context.params;

    const referralId = parseInt(id, 10);
    if (isNaN(referralId)) {
      return NextResponse.json({ error: "Invalid referral ID" }, { status: 400 });
    }

    // Read request body
    const { tokenAmount }: Body = await req.json();

    if (typeof tokenAmount !== "number" || tokenAmount <= 0) {
      return NextResponse.json({ error: "Token amount must be a positive number" }, { status: 400 });
    }

    //  Approve referral
    const referral = await prisma.referral.update({
      where: { id: referralId },
      data: {
        status: "APPROVED",
        tokensAwarded: tokenAmount,
      },
    });

    // Tokens are awarded to the referrer (the user who shared the code)
    const referrer = await prisma.user.findUnique({
      where: { id: referral.referrerId },
    });

    if (!referrer) {
      return NextResponse.json({ error: "Referrer not found" }, { status: 404 });
    }

    // Create token record
    const token = await prisma.token.create({
      data: {
        userId: referrer.id,
        adminId: admin.id,
        amount: tokenAmount,
      },
    });

    return NextResponse.json({
      message: "Referral approved and tokens assigned",
      referral,
      token,
    });
  } catch (error) {
    console.error("Approve referral error:", error);
    return NextResponse.json({ error: "Failed to approve referral" }, { status: 500 });
  }
}
