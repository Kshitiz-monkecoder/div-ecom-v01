import { NextRequest, NextResponse } from "next/server";
import { assignProductsToUser } from "@/app/actions/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();
    const { productIds } = body;

    if (!Array.isArray(productIds)) {
      return NextResponse.json(
        { error: "productIds must be an array" },
        { status: 400 }
      );
    }

    await assignProductsToUser(userId, productIds);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Error assigning products:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

