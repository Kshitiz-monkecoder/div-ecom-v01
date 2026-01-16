import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

    // Validate that it's a Cloudinary URL for security
    if (!url.includes("cloudinary.com") && !url.includes("res.cloudinary.com")) {
      return NextResponse.json(
        { error: "Invalid URL" },
        { status: 400 }
      );
    }

    // Decode the URL
    const decodedUrl = decodeURIComponent(url);
    
    // According to Cloudinary docs: Raw files (PDFs) are delivered directly using their URLs
    // Format: https://res.cloudinary.com/{cloud_name}/raw/upload/v{version}/{public_id}
    // The URL already points to the correct file, so we can fetch it directly
    // However, we should validate the URL format and extract proper filename
    
    // Parse Cloudinary raw URL to extract public_id and format
    // Format: https://res.cloudinary.com/{cloud_name}/raw/upload/v{version}/{folder}/{filename}.{ext}
    const urlMatch = decodedUrl.match(/res\.cloudinary\.com\/[^/]+\/raw\/upload\/v\d+\/(.+)/);
    
    if (!urlMatch) {
      return NextResponse.json(
        { error: "Invalid Cloudinary URL format" },
        { status: 400 }
      );
    }

    // The URL from Cloudinary is already correct - use it directly
    // Cloudinary serves raw files as-is, so the URL in the database should work
    return await fetchAndServeFile(decodedUrl);
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to download file" },
      { status: 500 }
    );
  }
}

async function fetchAndServeFile(url: string): Promise<NextResponse> {
  // Clean URL - remove any query parameters (Cloudinary adds version info)
  const cleanUrl = url.split('?')[0];
  
  // Fetch the file directly from Cloudinary
  // According to Cloudinary docs, raw files are served as-is from the URL
  const response = await fetch(cleanUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': '*/*',
    },
    // Don't follow redirects - Cloudinary URLs should be direct
    redirect: 'follow',
  });

  if (!response.ok) {
    console.error(`Failed to fetch file from Cloudinary:`, {
      url: cleanUrl,
      status: response.status,
      statusText: response.statusText,
    });
    return NextResponse.json(
      { error: `Failed to fetch file: ${response.statusText}` },
      { status: response.status }
    );
  }

  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Determine content type - check response headers first, then URL extension
  let contentType = response.headers.get("content-type");
  
  if (!contentType || contentType === "application/octet-stream" || contentType.includes("text/html")) {
    // Cloudinary might return HTML error pages, so check URL extension
    const urlLower = cleanUrl.toLowerCase();
    if (urlLower.endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else if (urlLower.endsWith('.doc')) {
      contentType = 'application/msword';
    } else if (urlLower.endsWith('.docx')) {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (urlLower.endsWith('.jpg') || urlLower.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (urlLower.endsWith('.png')) {
      contentType = 'image/png';
    } else {
      contentType = 'application/octet-stream';
    }
  }
  
  // Extract filename from URL
  // Cloudinary raw URL format: .../raw/upload/v{version}/{folder}/{filename}.{ext}
  const urlParts = cleanUrl.split("/");
  let filename = decodeURIComponent(urlParts[urlParts.length - 1] || "document");
  
  // If filename doesn't have extension, try to infer from content type
  if (!filename.includes('.')) {
    if (contentType === 'application/pdf') {
      filename += '.pdf';
    } else if (contentType.includes('word')) {
      filename += '.docx';
    }
  }

  // Validate we got actual file content (not an error page)
  if (buffer.length < 100 && contentType.includes("text/html")) {
    return NextResponse.json(
      { error: "Invalid file response from Cloudinary - file may not exist" },
      { status: 404 }
    );
  }

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff", // Prevent MIME type sniffing
    },
  });
}
