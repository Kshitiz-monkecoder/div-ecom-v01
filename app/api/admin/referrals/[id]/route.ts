import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const referrals = await prisma.referral.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(referrals);
}
