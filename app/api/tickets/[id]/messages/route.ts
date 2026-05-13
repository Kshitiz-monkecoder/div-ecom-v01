import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const messages = await divyEngineFetch<any[]>(`/api/ecom/tickets/${id}/messages`, {
      actor: { id: user.id, role: user.role },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[GET /api/tickets/[id]/messages]", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    const result = await divyEngineFetch<any>(`/api/ecom/tickets/${id}/messages`, {
      method: "POST",
      actor: { id: user.id, role: user.role },
      body: JSON.stringify({ message }),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[POST /api/tickets/[id]/messages]", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
