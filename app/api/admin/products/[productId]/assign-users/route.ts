import { NextRequest, NextResponse } from "next/server";
import { assignProductToUsers } from "@/app/actions/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const body = await request.json();
    const { userIds } = body;

    if (!Array.isArray(userIds)) {
      return NextResponse.json(
        { error: "userIds must be an array" },
        { status: 400 }
      );
    }

    await assignProductToUsers(productId, userIds);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Error assigning users to product:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

