import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;

    const referral = await divyEngineFetch<any>(`/api/ecom/admin/referrals/${id}/reject`, {
      method: "POST",
      actor: { id: admin.id, role: admin.role },
    });

    return NextResponse.json(referral);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to reject referral" }, { status: 500 });
  }
}
