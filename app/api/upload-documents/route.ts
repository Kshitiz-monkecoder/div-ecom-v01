import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadFile } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const uploadFolder = folder || "order-documents";
    const url = await uploadFile(file, uploadFolder);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload document" },
      { status: 500 }
    );
  }
}
