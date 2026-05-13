import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = await req.json();

    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const imageUrls: string[] = Array.isArray(body?.imageUrls) ? body.imageUrls : [];

    if (!message) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    const result = await divyEngineFetch<any>(`/api/ecom/admin/tickets/${id}/messages`, {
      method: "POST",
      actor: { id: admin.id, role: admin.role },
      body: JSON.stringify({ message, imageUrls }),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[POST /api/admin/tickets/[id]/messages]", error);
    return NextResponse.json({ error: "Failed to send admin reply" }, { status: 500 });
  }
}
