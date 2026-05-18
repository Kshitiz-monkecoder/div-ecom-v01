import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/proxy";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const admin = await requireAdmin();
  const { orderId } = await params;
  const body = await req.json();

  try {
    const data = await divyEngineFetch<any>(
      `/api/ecom/admin/orders/${orderId}/use-tokens`,
      {
        method: "POST",
        actor: { id: admin.id, role: admin.role },
        body: JSON.stringify(body),
      }
    );
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}