import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await divyEngineFetch<any[]>("/api/ecom/token-history", {
      actor: { id: user.id, role: user.role },
    });

    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("User token history error:", error);
    return NextResponse.json([], { status: 200 });
  }
}