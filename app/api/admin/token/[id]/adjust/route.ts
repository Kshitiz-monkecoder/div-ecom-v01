import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Body {
  amount: number; 
  adminId: string; 
  reason?: string;
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }   // userId
) {
  try {
    const body: Body = await req.json();
    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is missing" },
        { status: 400 }
      );
    }

    if (typeof body.amount !== "number" || body.amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    if (!body.adminId) {
      return NextResponse.json(
        { error: "Admin ID is missing" } ,
        { status: 400 }
      );
    }

     // Ensure  user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create token entry
    const token = await prisma.token.create({
      data: {
        amount: body.amount,
        userId,
        adminId: body.adminId,
      },
    });

    return NextResponse.json({
      message: "Tokens added successfully",
      token,
    });
  } catch (err) {
    console.error("Error adjusting tokens:", err);
    return NextResponse.json(
      { error: "Failed to adjust tokens" },
      { status: 500   }
    );
  }
}
