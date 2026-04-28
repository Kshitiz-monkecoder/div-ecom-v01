import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await divyEngineFetch<{ code: string }>("/api/ecom/referral-code", {
      actor: { id: user.id, role: user.role },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch referral code" }, { status: 500 });
  }
}
