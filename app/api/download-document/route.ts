import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
    }

    const encodedUrl = encodeURIComponent(url);

    const engineBase = process.env.DIVY_ENGINE_BASE_URL?.replace(/\/+$/, "") || "";
    const apiKey = process.env.DIVY_ENGINE_API_KEY || "";

    const response = await fetch(`${engineBase}/api/ecom/files/download?url=${encodedUrl}`, {
      headers: {
        "x-api-key": apiKey,
        "x-actor-id": user.id,
        "x-actor-role": user.role,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      return NextResponse.json(
        { error: errorBody || "Failed to download file" },
        { status: response.status }
      );
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/octet-stream",
        "Content-Disposition": response.headers.get("content-disposition") || "attachment",
        "Content-Length": response.headers.get("content-length") || String(arrayBuffer.byteLength),
        "Cache-Control": response.headers.get("cache-control") || "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to download file" },
      { status: 500 }
    );
  }
}
