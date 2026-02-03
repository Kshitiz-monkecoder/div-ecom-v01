import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const uploadPromises = files.map((file) => uploadImage(file));
    const urls = await Promise.all(uploadPromises);

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Ticket image upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload images" },
      { status: 500 }
    );
  }
}
