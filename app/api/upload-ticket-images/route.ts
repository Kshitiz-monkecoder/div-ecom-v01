import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";
import { filesToEnginePayload } from "@/lib/file-to-base64";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const payload = await filesToEnginePayload(files);

    const response = await divyEngineFetch<{ urls: string[] }>("/api/ecom/files/upload-ticket-images", {
      method: "POST",
      actor: { id: user.id, role: user.role },
      body: JSON.stringify({ files: payload }),
    });

    return NextResponse.json({ urls: response.urls });
  } catch (error) {
    console.error("Ticket image upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload images" },
      { status: 500 }
    );
  }
}
