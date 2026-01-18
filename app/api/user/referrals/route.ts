import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, product, referralCode } = body;

    // Validate required fields
    if (!name || !phone || !email || !product) {
      return NextResponse.json(
        { error: "All fields except referral code are required." },
        { status: 400 }
      );
    }

    // Fetch referrer user based on referralCode
    const referrerUser = await prisma.user.findUnique({
      where: { referralCode: referralCode || "" }, // or however you store codes
    });

    if (!referrerUser) {
      return NextResponse.json(
        { error: "Invalid referral code or referrer not found." },
        { status: 404 }
      );
    }

    // Create referral
    await prisma.referral.create({
      data: {
        name,
        phone,
        email,
        product,
        referrerId: referrerUser.id, // now this is always defined
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
