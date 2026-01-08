import { NextResponse } from "next/server";
import { getProductAssignedUsers } from "@/app/actions/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const users = await getProductAssignedUsers(productId);

    return NextResponse.json({
      success: true,
      userIds: users.map((user) => user.id),
    });
  } catch (error: any) {
    console.error("Error fetching assigned users:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

