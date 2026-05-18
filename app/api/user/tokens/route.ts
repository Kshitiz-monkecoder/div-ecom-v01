import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokens = await divyEngineFetch<any[]>("/api/ecom/tokens", {
      actor: { id: user.id, role: user.role },
    });

    return NextResponse.json(tokens);
  } catch (error) {
    console.error("User tokens error:", error);
    return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 });
  }
}
