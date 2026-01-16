import { Order, OrderItem, User } from "@prisma/client";

interface WarrantyData {
  order: Order & {
    items: (OrderItem & {
      product?: {
        name: string;
      } | null;
    })[];
    user: User;
  };
}

/**
 * Generate warranty card HTML template
 * This can be converted to PDF using a PDF library or rendered in the browser
 */
export function generateWarrantyHTML(data: WarrantyData): string {
  const { order, order: { items, user } } = data;
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalInRupees = (totalAmount / 100).toFixed(2);

  const itemsHTML = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.capacity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">₹${(item.unitPrice / 100).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Warranty Card - ${order.orderNumber}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 40px;
      background: white;
    }
    .warranty-card {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #1f2937;
      padding: 30px;
      background: white;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #1f2937;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      color: #1f2937;
      font-size: 28px;
    }
    .header h2 {
      margin: 10px 0 0 0;
      color: #4b5563;
      font-size: 18px;
      font-weight: normal;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 10px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 5px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 150px 1fr;
      gap: 10px;
      margin-bottom: 15px;
    }
    .info-label {
      font-weight: 600;
      color: #4b5563;
    }
    .info-value {
      color: #1f2937;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th {
      background-color: #f3f4f6;
      padding: 10px 8px;
      text-align: left;
      font-weight: 600;
      color: #1f2937;
      border-bottom: 2px solid #1f2937;
    }
    td {
      padding: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    .total-row {
      font-weight: bold;
      font-size: 16px;
      background-color: #f9fafb;
    }
    .warranty-terms {
      margin-top: 30px;
      padding: 20px;
      background-color: #f9fafb;
      border-left: 4px solid #1f2937;
    }
    .warranty-terms h3 {
      margin-top: 0;
      color: #1f2937;
    }
    .warranty-terms ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .warranty-terms li {
      margin-bottom: 8px;
      color: #4b5563;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="warranty-card">
    <div class="header">
      <h1>WARRANTY CARD</h1>
      <h2>Solar Products Warranty Certificate</h2>
    </div>

    <div class="section">
      <div class="section-title">Order Information</div>
      <div class="info-grid">
        <div class="info-label">Order Number:</div>
        <div class="info-value"><strong>${order.orderNumber}</strong></div>
        <div class="info-label">Order Date:</div>
        <div class="info-value">${orderDate}</div>
        <div class="info-label">Status:</div>
        <div class="info-value">${order.status}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Customer Information</div>
      <div class="info-grid">
        <div class="info-label">Name:</div>
        <div class="info-value">${user.name}</div>
        <div class="info-label">Email:</div>
        <div class="info-value">${user.email || "Not provided"}</div>
        <div class="info-label">Phone:</div>
        <div class="info-value">${user.phone}</div>
        <div class="info-label">Installation Address:</div>
        <div class="info-value">${order.address}</div>
        <div class="info-label">Contact Phone:</div>
        <div class="info-value">${order.phone}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Products Covered</div>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Capacity</th>
            <th>Quantity</th>
            <th>Unit Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
          <tr class="total-row">
            <td colspan="3" style="text-align: right; padding-right: 20px;">Total Amount:</td>
            <td>₹${totalInRupees}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="warranty-terms">
      <h3>Warranty Terms & Conditions</h3>
      <ul>
        <li>This warranty card is valid from the date of installation.</li>
        <li>The warranty period covers manufacturing defects and performance issues.</li>
        <li>Regular maintenance is required to keep the warranty valid.</li>
        <li>Any modifications or unauthorized repairs will void the warranty.</li>
        <li>Please contact our support team for any warranty claims.</li>
        <li>Keep this warranty card safe for future reference.</li>
      </ul>
      ${order.notes ? `<p><strong>Additional Notes:</strong> ${order.notes}</p>` : ""}
    </div>

    <div class="footer">
      <p>This is an electronically generated warranty card. For any queries, please contact our customer support.</p>
      <p>Generated on: ${new Date().toLocaleString("en-IN")}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate warranty card as PDF buffer
 * Note: This requires pdfkit or puppeteer to be installed
 * For now, we'll return the HTML and convert it on the server side
 */
export async function generateWarrantyPDF(data: WarrantyData): Promise<Buffer> {
  // For now, we'll use a simple approach with html-pdf-node or similar
  // This is a placeholder - in production, you'd use pdfkit, puppeteer, or html-pdf-node
  generateWarrantyHTML(data);
  
  // In a real implementation, you would convert HTML to PDF here
  // For example, using puppeteer or html-pdf-node:
  // const pdf = await htmlToPdf(html);
  // return pdf;
  
  // For now, we'll throw an error indicating the library needs to be set up
  throw new Error(
    "PDF generation requires a PDF library. Please install pdfkit, puppeteer, or html-pdf-node and implement the conversion."
  );
}

/**
 * Generate warranty card and return as data URL for preview/download
 */
export function generateWarrantyDataURL(data: WarrantyData): string {
  const html = generateWarrantyHTML(data);
  const blob = new Blob([html], { type: "text/html" });
  // Note: This is a client-side function, for server-side we need different approach
  return URL.createObjectURL(blob);
}
