import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId"); // optional filter

    const users = await prisma.user.findMany({
      where: userId ? { id: userId } : {},
      select: { id: true, name: true, email: true, tokens: true },
    });

    return NextResponse.json(users);
  } catch (err) {
    console.error("Error fetching tokens:", err);
    return NextResponse.json(
      { error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}
