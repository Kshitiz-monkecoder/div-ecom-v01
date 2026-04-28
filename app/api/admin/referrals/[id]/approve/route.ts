import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";

interface Body {
  tokenAmount: number;
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const { tokenAmount }: Body = await req.json();

    if (typeof tokenAmount !== "number" || tokenAmount <= 0) {
      return NextResponse.json({ error: "Token amount must be a positive number" }, { status: 400 });
    }

    const result = await divyEngineFetch<any>(`/api/ecom/admin/referrals/${id}/approve`, {
      method: "POST",
      actor: { id: admin.id, role: admin.role },
      body: JSON.stringify({ tokenAmount }),
    });

    return NextResponse.json({
      message: "Referral approved and tokens assigned",
      referral: result.referral,
      token: result.token,
    });
  } catch (error) {
    console.error("Approve referral error:", error);
    return NextResponse.json({ error: "Failed to approve referral" }, { status: 500 });
  }
}
