import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function GET() {
  try {
    const admin = await requireAdmin();
    const users = await divyEngineFetch<any[]>("/api/ecom/admin/users-for-assignment", {
      actor: { id: admin.id, role: admin.role },
    });

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error("Error fetching users for assignment:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
