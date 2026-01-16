import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, product, referralCode } = body;

    if (!name || !phone || !email || !product) {
      return NextResponse.json(
        { error: "All fields except referral code are required." },
        { status: 400 }
      );
    }

    await prisma.referral.create({
      data: {
        name,
        phone,
        email,
        product,
        referralCode: referralCode || null,
        status: "pending",
      },
    });

    return NextResponse.json({
      message: "Referral submitted successfully!",
    });
  } catch (error) {
    console.error("Referral API error:", error);
    return NextResponse.json(
      { error: "Failed to submit referral" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const referrals = await prisma.referral.findMany({
      orderBy: { submittedAt: "desc" },
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
