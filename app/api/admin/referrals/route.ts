import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function GET() {
  const admin = await requireAdmin();

  const referrals = await divyEngineFetch<any[]>("/api/ecom/admin/referrals", {
    actor: { id: admin.id, role: admin.role },
  });

  return NextResponse.json(referrals);
}
