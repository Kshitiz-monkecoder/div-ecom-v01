import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } } // keep typing
) {
  try {
    // UNWRAP params
    const actualParams = await params;
    const referralId = parseInt(actualParams.id, 10);

    if (isNaN(referralId)) {
      return NextResponse.json(
        { error: "Invalid referral ID" },
        { status: 400 }
      );
    }

    const referral = await prisma.referral.update({
      where: { id: referralId },
      data: { status: "REJECTED" }, // only difference from approve
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
