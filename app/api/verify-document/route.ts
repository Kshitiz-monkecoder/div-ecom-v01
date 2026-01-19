import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Diagnostic endpoint to verify document URLs in database
 * GET /api/verify-document?orderId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        warrantyCardUrl: true,
        invoiceUrl: true,
        additionalFiles: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const additionalFiles = order.additionalFiles ? JSON.parse(order.additionalFiles) : [];

    // Test each URL
    const urlChecks = [];

    if (order.warrantyCardUrl) {
      try {
        const response = await fetch(order.warrantyCardUrl, { method: "HEAD" });
        urlChecks.push({
          type: "warranty",
          url: order.warrantyCardUrl,
          status: response.status,
          contentType: response.headers.get("content-type"),
          valid: response.ok,
        });
      } catch (error) {
        urlChecks.push({
          type: "warranty",
          url: order.warrantyCardUrl,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    if (order.invoiceUrl) {
      try {
        const response = await fetch(order.invoiceUrl, { method: "HEAD" });
        urlChecks.push({
          type: "invoice",
          url: order.invoiceUrl,
          status: response.status,
          contentType: response.headers.get("content-type"),
          valid: response.ok,
        });
      } catch (error) {
        urlChecks.push({
          type: "invoice",
          url: order.invoiceUrl,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    for (let i = 0; i < additionalFiles.length; i++) {
      try {
        const response = await fetch(additionalFiles[i], { method: "HEAD" });
        urlChecks.push({
          type: `additional-${i + 1}`,
          url: additionalFiles[i],
          status: response.status,
          contentType: response.headers.get("content-type"),
          valid: response.ok,
        });
      } catch (error) {
        urlChecks.push({
          type: `additional-${i + 1}`,
          url: additionalFiles[i],
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      urlChecks,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed" },
      { status: 500 }
    );
  }
}
