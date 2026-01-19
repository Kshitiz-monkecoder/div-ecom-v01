import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  await requireAdmin();
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
