// app/api/admin/referrals/[id]/approve/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Body {
  adminId: string;
  tokenAmount: number;
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> } // ✅ params is a Promise
) {
  try {
    // ✅ Await params to get the dynamic id
    const { id } = await context.params;

    const referralId = parseInt(id, 10);
    if (isNaN(referralId)) {
      return NextResponse.json({ error: "Invalid referral ID" }, { status: 400 });
    }

    // Read request body
    const { adminId, tokenAmount }: Body = await req.json();

    if (!adminId) {
      return NextResponse.json({ error: "Admin ID is required" }, { status: 400 });
    }

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

    // 2️⃣ Find the user using phone
    const user = await prisma.user.findUnique({
      where: { phone: referral.phone },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found for this phone number" }, { status: 404 });
    }

    // Create token record
    const token = await prisma.token.create({
      data: {
        userId: user.id,
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
