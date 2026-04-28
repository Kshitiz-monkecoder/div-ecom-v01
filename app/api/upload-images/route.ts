import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";
import { filesToEnginePayload } from "@/lib/file-to-base64";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const payload = await filesToEnginePayload(files);

    const response = await divyEngineFetch<{ urls: string[] }>("/api/ecom/files/upload-images", {
      method: "POST",
      actor: { id: admin.id, role: admin.role },
      body: JSON.stringify({ files: payload }),
    });

    return NextResponse.json({ urls: response.urls });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload images" },
      { status: 500 }
    );
  }
}
