import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/proxy";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  const body = await req.json();

  try {
    const data = await divyEngineFetch<any>("/api/ecom/admin/tokens/utilize", {
      method: "POST",
      actor: { id: admin.id, role: admin.role },
      body: JSON.stringify({
        userId: body.userId,
        amount: body.amount,
        description: body.description,
      }),
    });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to utilize tokens";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}