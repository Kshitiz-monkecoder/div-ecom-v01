import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { userId } = await params;
    const body = await request.json();
    const { productIds } = body;

    if (!Array.isArray(productIds)) {
      return NextResponse.json({ error: "productIds must be an array" }, { status: 400 });
    }

    await divyEngineFetch<{ success: true }>(`/api/ecom/admin/users/${userId}/assign-products`, {
      method: "POST",
      actor: { id: admin.id, role: admin.role },
      body: JSON.stringify({ productIds }),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error assigning products:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
