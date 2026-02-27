import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * CREATE REFERRAL
 * POST /api/referrals
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, product, referralCode } = body;

    // 1️⃣ Validate required fields (email optional for refer landing)
    if (!name || !phone || !product) {
      return NextResponse.json(
        { error: "Name, phone and product are required." },
        { status: 400 }
      );
    }
    const emailToSave = email && String(email).trim() ? String(email).trim() : "referral@divypower.in";

    // 2️⃣ Find referrer by referralCode
    const referrerUser = await prisma.user.findUnique({
      where: { referralCode: referralCode || "" },
    });

    if (!referrerUser) {
      return NextResponse.json(
        { error: "Invalid referral code or referrer not found." },
        { status: 404 }
      );
    }

    // 2.5️⃣ Reject if this phone was already referred (unique constraint)
    const existing = await prisma.referral.findUnique({
      where: { phone },
    });
    if (existing) {
      return NextResponse.json(
        { error: "This phone number has already been referred." },
        { status: 409 }
      );
    }

    // 3️⃣ Create referral with default tokensAwarded
    await prisma.referral.create({
      data: {
        name,
        phone,
        email: emailToSave,
        product,
        referrerId: referrerUser.id,
        status: "PENDING",       // ✅ consistent status
        tokensAwarded: 0,        // ✅ IMPORTANT
      },
    });

    return NextResponse.json({
      message: "Referral submitted successfully!",
    });
  } catch (error: unknown) {
    console.error("Referral API error:", error);
    // Handle unique constraint violation (race condition / concurrent submit)
    const isPrisma = error && typeof error === "object" && "code" in error;
    if (isPrisma && (error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "This phone number has already been referred." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to submit referral" },
      { status: 500 }
    );
  }
}

/**
 * FETCH REFERRALS (current user's referrals only)
 * GET /api/user/referrals
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const referrals = await prisma.referral.findMany({
      where: { referrerId: user.id },
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        product: true,
        status: true,
        tokensAwarded: true,
        submittedAt: true,
        referrer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(referrals);
  } catch (error) {
    console.error("Fetch referrals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch referrals" },
      { status: 500 }
    );
  }
}
