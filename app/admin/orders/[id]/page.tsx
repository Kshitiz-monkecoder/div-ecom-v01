import { getOrder } from "@/app/actions/orders";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { OrderStatusForm } from "@/components/order-status-form";
import { format } from "date-fns";
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
import { FileText, Download, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const totalAmount = order.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const totalInRupees = (totalAmount / 100).toFixed(2);

  const additionalFiles = order.additionalFiles
    ? JSON.parse(order.additionalFiles)
    : [];

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/orders">
          <Button variant="ghost">← Back to Orders</Button>
        </Link>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order {order.orderNumber}</h1>
            <p className="text-gray-500">
              Created on {format(new Date(order.createdAt), "MMMM dd, yyyy 'at' HH:mm")}
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
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.capacity}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>₹{(item.unitPrice / 100).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{((item.unitPrice * item.quantity) / 100).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={order.warrantyCardUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={`/api/download-document?url=${encodeURIComponent(order.warrantyCardUrl)}`}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </div>
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={`/api/download-document?url=${encodeURIComponent(order.invoiceUrl)}`}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </div>
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
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={`/api/download-document?url=${encodeURIComponent(fileUrl)}`}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      </div>
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

