import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { productId } = await params;

    const users = await divyEngineFetch<any[]>(`/api/ecom/admin/products/${productId}/assigned-users`, {
      actor: { id: admin.id, role: admin.role },
    });

    return NextResponse.json({ success: true, userIds: users.map((user) => user.id) });
  } catch (error: any) {
    console.error("Error fetching assigned users:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
