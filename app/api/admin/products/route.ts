import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function GET() {
  try {
    const admin = await requireAdmin();
    const products = await divyEngineFetch<any[]>("/api/ecom/admin/products", {
      actor: { id: admin.id, role: admin.role },
    });

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
