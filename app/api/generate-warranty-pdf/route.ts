import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import path from "node:path";
import fs from "node:fs/promises";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { requireAdmin } from "@/lib/auth";
import { uploadPdfBuffer } from "@/lib/cloudinary";
import { renderWarrantyHtml, type WarrantyPdfInput } from "@/lib/warranty-pdf/template";

export const runtime = "nodejs";
// Allow up to 60s for PDF generation (Vercel Pro; Hobby caps at 10s)
export const maxDuration = 60;

const WarrantyPdfInputSchema = z.object({
  documentNo: z.string().min(1),
  systemSizeKwp: z.string().min(1),
  customerName: z.string().min(1),
  customerNumber: z.string().min(1),
  customerAddress: z.string().min(1),
  pinCode: z.string().min(1),
  installationDate: z.string().min(1),
  invoiceNo: z.string().min(1),

  moduleType: z.string().min(1),
  moduleSerialNumbers: z.array(z.string()).default([]),

  inverterWarrantyYears: z.number().int().positive(),
  inverterModel: z.string().min(1),
  inverterSerialNumber: z.string().min(1),
});

function toDataUrl(mime: string, buffer: Buffer): string {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

async function readPublicAsset(filename: string): Promise<Buffer> {
  const candidates = [
    path.join(process.cwd(), "public", filename),
    path.join(process.cwd(), "ecom", "public", filename),
  ];

  for (const p of candidates) {
    try {
      return await fs.readFile(p);
    } catch {
      // try next path
    }
  }

  throw new Error(`Missing public asset: ${filename}`);
}

function safeIdPart(input: string): string {
  return input
    .trim()
    .replace(/\.pdf$/i, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .substring(0, 120);
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const json = await request.json();
    const input = WarrantyPdfInputSchema.parse(json) as WarrantyPdfInput;

    const [logoBuf, signBuf] = await Promise.all([
      readPublicAsset("divy-power-logo.png"),
      readPublicAsset("sign.png"),
    ]);

    const html = renderWarrantyHtml(input, {
      logoDataUrl: toDataUrl("image/png", logoBuf),
      signDataUrl: toDataUrl("image/png", signBuf),
    });

    // Use @sparticuz/chromium for serverless (Vercel, Lambda, etc.); includes executable and flags
    chromium.setGraphicsMode = false; // PDF only, no WebGL needed
    const browser = await puppeteer.launch({
      executablePath: await chromium.executablePath(),
      args: chromium.args,
      headless: true,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
      });

      const pdfUrl = await uploadPdfBuffer(Buffer.from(pdfBuffer), {
        folder: "warranty-documents",
        publicId: `warranty_${safeIdPart(input.documentNo)}`,
      });

      return NextResponse.json({ success: true, pdfUrl });
    } finally {
      await browser.close();
    }
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

