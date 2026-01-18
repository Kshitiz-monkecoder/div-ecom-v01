import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Body {
  adminId: string;
  tokenAmount: number;
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ IMPORTANT: await params (Next.js requirement)
    const { id } = await context.params;
    const referralId = parseInt(id, 10);

    if (isNaN(referralId)) {
      return NextResponse.json(
        { error: "Invalid referral ID" },
        { status: 400 }
      );
    }

    // Read request body
    const { adminId, tokenAmount }: Body = await req.json();

    if (!adminId) {
      return NextResponse.json(
        { error: "Admin ID is required" },
        { status: 400 }
      );
    }

    if (typeof tokenAmount !== "number" || tokenAmount <= 0) {
      return NextResponse.json(
        { error: "Token amount must be a positive number" },
        { status: 400 }
      );
    }

    // 1️⃣ Approve referral
    const referral = await prisma.referral.update({
      where: { id: referralId },
      data: {
        status: "APPROVED",
        tokensAwarded: tokenAmount, // optional but recommended
      },
    });

    // 2️⃣ Find user using phone (unique)
    const user = await prisma.user.findUnique({
      where: { phone: referral.phone },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found for this phone number" },
        { status: 404 }
      );
    }

    // 3️⃣ Create token
    const token = await prisma.token.create({
      data: {
        userId: user.id,
        // adminId: null,
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
    return NextResponse.json(
      { error: "Failed to approve referral" },
      { status: 500 }
    );
  }
}
