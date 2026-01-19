import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ unwrap params properly
    const { id } = await context.params;
    const referralId = Number(id);

    if (isNaN(referralId)) {
      return NextResponse.json(
        { error: "Invalid referral ID" },
        { status: 400 }
      );
    }

    const referral = await prisma.referral.update({
      where: { id: referralId },
      data: { status: "REJECTED" },
    });

    return NextResponse.json(referral);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to reject referral" },
      { status: 500 }
    );
  }
}
