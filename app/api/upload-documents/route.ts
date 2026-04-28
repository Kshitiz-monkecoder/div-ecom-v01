import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";
import { fileToBase64 } from "@/lib/file-to-base64";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const base64 = await fileToBase64(file);

    const response = await divyEngineFetch<{ url: string }>("/api/ecom/files/upload-document", {
      method: "POST",
      actor: { id: admin.id, role: admin.role },
      body: JSON.stringify({ fileName: file.name, base64, folder: folder || "order-documents" }),
    });

    return NextResponse.json({ url: response.url });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload document" },
      { status: 500 }
    );
  }
}
