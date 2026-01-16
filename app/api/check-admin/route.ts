import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({
      isAdmin: user?.role === "ADMIN",
      user: user
        ? {
            name: user.name,
            phone: user.phone,
            email: user.email,
          }
        : null,
    });
  } catch {
    return NextResponse.json({ isAdmin: false, user: null });
  }
}

