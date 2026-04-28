import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    const response = await divyEngineFetch<{ pdfUrl: string }>("/api/ecom/warranty/generate-pdf", {
      method: "POST",
      actor: { id: admin.id, role: admin.role },
      body: JSON.stringify(body),
    });

    return NextResponse.json({ success: true, pdfUrl: response.pdfUrl });
  } catch (error) {
    console.error("Generate warranty PDF error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate warranty PDF",
      },
      { status: 500 }
    );
  }
}
