import { NextResponse } from "next/server";
import { getAllUsersForAssignment } from "@/app/actions/admin";

export async function GET() {
  try {
    const users = await getAllUsersForAssignment();

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error: any) {
    console.error("Error fetching users for assignment:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

