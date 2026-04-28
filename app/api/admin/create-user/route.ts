import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { name, phone, email } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required and must be a non-empty string" }, { status: 400 });
    }

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: "Phone number must be exactly 10 digits" }, { status: 400 });
    }

    const user = await divyEngineFetch<any>("/api/ecom/admin/users", {
      method: "POST",
      actor: { id: admin.id, role: admin.role },
      body: JSON.stringify({ name: name.trim(), phone: cleanPhone, email: email?.trim() || undefined }),
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Error creating user:", error);
    const errorMessage = error?.message || "Internal server error";
    const statusCode = errorMessage.includes("already exists") ? 409 : 500;
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
