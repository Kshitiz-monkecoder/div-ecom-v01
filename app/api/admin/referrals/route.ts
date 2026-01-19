import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const referrals = await prisma.referral.findMany({
    orderBy: { submittedAt: "desc" },
    include: {
      referrer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true, 
        },
      },
    },
  });

  return NextResponse.json(referrals);
}
