import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = {
  params: {
    id: string;
  };
};

export async function POST(
  req: Request,
  context: Context
) {
  try {
    const id = Number(context.params.id);

    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid referral ID" },
        { status: 400 }
      );
    }

    await prisma.referral.update({
      where: { id },
      data: { status: "rejected" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reject referral error:", error);

    return NextResponse.json(
      { error: "Failed to reject referral" },
      { status: 500 }
    );
  }
}
