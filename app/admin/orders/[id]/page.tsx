import { getOrder } from "@/app/actions/orders";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { OrderStatusForm } from "@/components/order-status-form";
import { formatInTimeZone } from "date-fns-tz";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, ExternalLink, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderMaterialDeliveryToggle } from "@/components/order-material-delivery-toggle";
import { OrderManualApprovalForm } from "@/components/order-manual-approval-form";
import { parseStringArray } from "@/lib/json";
import { divyEngineFetch } from "@/lib/divy-engine-api";

function resolveOrderTotal(order: any): number {
  const fromItems = order.items.reduce(
    (sum: number, item: any) =>
      sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0),
    0
  );
  if (fromItems > 0) return fromItems;

  // Vritika-imported orders have unitPrice=0 but store total_price in sourcePayload (in rupees)
  const fallback = Number(order.sourcePayload?.order?.total_price);
  return fallback > 0 ? Math.round(fallback * 100) : 0;
}

function resolveItemPrice(item: any, order: any): number {
  if ((Number(item.unitPrice) || 0) > 0) {
    return Number(item.unitPrice);
  }
  // For Vritika single-item orders, spread total_price across the item
  const fallback = Number(order.sourcePayload?.order?.total_price);
  if (fallback > 0 && order.items.length === 1) {
    return Math.round(fallback * 100);
  }
  return 0;
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id).catch(() => null);

  if (!order) {
    notFound();
  }

  const tokens = await divyEngineFetch<any[]>(`/api/ecom/tokens`, {
    actor: { id: order.user.id, role: "USER" },
  }).catch(() => []);

  const availableTokens = tokens
    .filter((t: any) => t.status === "UNUSED")
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const totalAmount = resolveOrderTotal(order);
  const totalInRupees = (totalAmount / 100).toFixed(2);

  const additionalFiles = parseStringArray(order.additionalFiles);
  const manualApprovedStage = order.canonicalStages?.find(
    (stage: any) => stage.stageName === "MANUAL_APPROVED"
  );
  const manuallyApproved = manualApprovedStage?.status === "completed";

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/orders">
            <Button variant="ghost">← Back to Orders</Button>
          </Link>
          <Link href={`/admin/orders/${order.id}/pipeline`}>
            <Button variant="outline">View Pipeline</Button>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order {order.orderNumber}</h1>
            <p className="text-gray-500">
              Created on{" "}
              {formatInTimeZone(
                new Date(order.createdAt),
                "Asia/Kolkata",
                "MMMM dd, yyyy 'at' hh:mm aa"
              )}
            </p>
          </div>
          <StatusBadge status={order.status} type="order" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><span className="font-medium">Name:</span> {order.user.name}</p>
              <p><span className="font-medium">Email:</span> {order.user.email || "Not provided"}</p>
              <p><span className="font-medium">Phone:</span> {order.user.phone}</p>
            </CardContent>
          </Card>

          {order.referralInfo && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-amber-800 flex items-center gap-2">
                  🪙 Referred Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="font-medium">Referred by:</span> {order.referralInfo.referrer?.name}</p>
                <p><span className="font-medium">Referrer phone:</span> {order.referralInfo.referrer?.phone}</p>
                <p><span className="font-medium">Referral code used:</span> {order.referralInfo.referrer?.referralCode}</p>
                <p><span className="font-medium">Status:</span> {order.referralInfo.status}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Installation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><span className="font-medium">Address:</span> {order.address}</p>
              <p><span className="font-medium">Phone:</span> {order.phone}</p>
              {order.notes && (
                <p><span className="font-medium">Notes:</span> {order.notes}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Products ({order.items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead className="text-right">Line Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item: any) => {
                  const resolvedPrice = resolveItemPrice(item, order);
                  const qty = Number(item.quantity) || 1;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.capacity}</TableCell>
                      <TableCell>{qty}</TableCell>
                      <TableCell>₹{(resolvedPrice / 100).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{((resolvedPrice * qty) / 100).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="font-bold">
                  <TableCell colSpan={4} className="text-right">
                    Total Amount:
                  </TableCell>
                  <TableCell className="text-right">₹{totalInRupees}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.warrantyCardUrl && (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Warranty Card</p>
                    <p className="text-sm text-gray-500">PDF Document</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={order.warrantyCardUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View
                  </a>
                </Button>
              </div>
            )}

            {order.invoiceUrl && (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">Invoice</p>
                    <p className="text-sm text-gray-500">PDF Document</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View
                  </a>
                </Button>
              </div>
            )}

            {additionalFiles.length > 0 && (
              <div>
                <p className="font-medium mb-2">Additional Files ({additionalFiles.length})</p>
                <div className="space-y-2">
                  {additionalFiles.map((fileUrl: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <p className="text-sm">File {index + 1}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!order.warrantyCardUrl && !order.invoiceUrl && additionalFiles.length === 0 && (
              <p className="text-center text-gray-500 py-4">No documents uploaded</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderManualApprovalForm
              orderId={order.id}
              manuallyApproved={Boolean(manuallyApproved)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Material Delivery</CardTitle>
            <p className="text-sm text-muted-foreground font-normal">
              {order.isMaterialDelivery ? "Material delivery order" : "Installation/service delivery"}
            </p>
          </CardHeader>
          <CardContent>
            <OrderMaterialDeliveryToggle
              orderId={order.id}
              isMaterialDelivery={order.isMaterialDelivery}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusForm orderId={order.id} currentStatus={order.status} />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}