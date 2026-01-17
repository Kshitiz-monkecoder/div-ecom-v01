import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const referral = await prisma.referral.update({
    where: { id: params.id },
    data: { status: "REJECTED" },
  });

  return NextResponse.json(referral);
}
