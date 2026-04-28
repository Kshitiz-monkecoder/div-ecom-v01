import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { divyEngineFetch } from "@/lib/divy-engine-api";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const order = await divyEngineFetch<{
      id: string;
      orderNumber: string;
      warrantyCardUrl: string | null;
      invoiceUrl: string | null;
      additionalFiles: string[];
    }>(`/api/ecom/orders/${orderId}/documents`, {
      actor: { id: user.id, role: user.role },
    });

    const urlChecks: Array<Record<string, unknown>> = [];

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

    for (let i = 0; i < order.additionalFiles.length; i++) {
      try {
        const response = await fetch(order.additionalFiles[i], { method: "HEAD" });
        urlChecks.push({
          type: `additional-${i + 1}`,
          url: order.additionalFiles[i],
          status: response.status,
          contentType: response.headers.get("content-type"),
          valid: response.ok,
        });
      } catch (error) {
        urlChecks.push({
          type: `additional-${i + 1}`,
          url: order.additionalFiles[i],
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
