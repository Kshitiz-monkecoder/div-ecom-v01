import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const referralId = Number(params.id);

    if (isNaN(referralId)) {
      return NextResponse.json(
        { error: "Invalid referral ID" },
        { status: 400 }
      );
    }

    const referral = await prisma.referral.update({
      where: { id: referralId }, // ✅ number
      data: { status: "APPROVED" },
    });

    return NextResponse.json(referral);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to approve referral" },
      { status: 500 }
    );
  }
}
