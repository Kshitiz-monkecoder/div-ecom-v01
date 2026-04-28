import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { productId } = await params;
    const body = await request.json();
    const { userIds } = body;

    if (!Array.isArray(userIds)) {
      return NextResponse.json({ error: "userIds must be an array" }, { status: 400 });
    }

    await divyEngineFetch<{ success: true }>(`/api/ecom/admin/products/${productId}/assign-users`, {
      method: "POST",
      actor: { id: admin.id, role: admin.role },
      body: JSON.stringify({ userIds }),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error assigning users to product:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
