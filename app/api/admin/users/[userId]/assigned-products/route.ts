import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { userId } = await params;

    const products = await divyEngineFetch<any[]>(`/api/ecom/admin/users/${userId}/assigned-products`, {
      actor: { id: admin.id, role: admin.role },
    });

    return NextResponse.json({ success: true, productIds: products.map((product) => product.id) });
  } catch (error: any) {
    console.error("Error fetching assigned products:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
