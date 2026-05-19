import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/proxy";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function GET() {
  const admin = await requireAdmin();

  const data = await divyEngineFetch<any[]>("/api/ecom/admin/tokens/users", {
    actor: { id: admin.id, role: admin.role },
  });

  return NextResponse.json(data);
}