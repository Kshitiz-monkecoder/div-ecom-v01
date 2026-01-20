import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";
import { renderWarrantyHtml } from "../lib/warranty-pdf/template";

function toDataUrl(mime: string, buffer: Buffer): string {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

async function main() {
  const logo = await fs.readFile(path.join(process.cwd(), "public", "divy-power-logo.png"));
  const sign = await fs.readFile(path.join(process.cwd(), "public", "sign.png"));

  const input = {
    documentNo: "DV25GST-83",
    systemSizeKwp: "4 KWP",
    customerName: "JAIBIR SINGH PAYAL",
    customerNumber: "8800328373",
    customerAddress: "FLAT NO.8 METRO COMPLEX SEC 5 RAJENDRA NAGAR 201005",
    pinCode: "201005",
    installationDate: "28-08-2024",
    invoiceNo: "DV25GST-83",
    moduleType: "Monocrystline 500WP Bluebird",
    moduleSerialNumbers: [
      "MS2404301A0928",
      "MS2404301A0966",
      "MS2404301A0956",
      "MS2404301A0961",
      "MS2404301A0959",
      "MS2404301A0883",
    ],
    inverterWarrantyYears: 5,
    inverterModel: "DEYE 3 SUN-3K-G01",
    inverterSerialNumber: "XM4033K5621039",
  };

  const html = renderWarrantyHtml(input, {
    logoDataUrl: toDataUrl("image/png", Buffer.from(logo)),
    signDataUrl: toDataUrl("image/png", Buffer.from(sign)),
  });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    const outPath = path.join(process.cwd(), "assets", "warranty-generated-test.pdf");
    await fs.writeFile(outPath, Buffer.from(pdf));
    // eslint-disable-next-line no-console
    console.log(`Wrote: ${outPath} (${pdf.byteLength} bytes)`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

