import CustomerLayout from "@/components/customer-layout";
import { StatusBadge } from "@/components/status-badge";
import { getOrder } from "@/app/actions/orders";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ExternalLink, Shield, Receipt, Paperclip } from "lucide-react";

export default async function OrderDetailPage({
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
    <CustomerLayout>
      <div className="max-w-5xl">
        <div className="mb-6">
          <Link href="/orders">
            <Button variant="ghost">← Back to Orders</Button>
          </Link>
        </div>

        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Order {order.orderNumber}</h1>
                  <p className="text-gray-500">
                    Placed on {format(new Date(order.createdAt), "MMMM dd, yyyy 'at' HH:mm")}
                  </p>
                </div>
                <StatusBadge status={order.status} type="order" />
              </div>
            </CardContent>
          </Card>

          {/* Products Section */}
          <Card>
            <CardHeader>
              <CardTitle>Products ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.capacity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ₹{((item.unitPrice * item.quantity) / 100).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ₹{(item.unitPrice / 100).toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold">₹{totalInRupees}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Section */}
          <Card>
            <CardHeader>
              <CardTitle>Documents & Certificates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.warrantyCardUrl && (
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold">Warranty Card</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Your warranty certificate for this order
                        </p>
                      </div>
                    </div>
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
                  </div>
                </div>
              )}

              {order.invoiceUrl && (
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Receipt className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold">Invoice</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Order invoice and payment details
                        </p>
                      </div>
                    </div>
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
                  </div>
                </div>
              )}

              {additionalFiles.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Paperclip className="w-5 h-5" />
                    Additional Files ({additionalFiles.length})
                  </h3>
                  <div className="space-y-2">
                    {additionalFiles.map((fileUrl: string, index: number) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-500" />
                          <span className="text-sm font-medium">File {index + 1}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
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
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No documents available for this order</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Installation Details */}
          <Card>
            <CardHeader>
              <CardTitle>Installation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Address:</span>
                <p className="mt-1">{order.address}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Contact Phone:</span>
                <p className="mt-1">{order.phone}</p>
              </div>
              {order.notes && (
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Notes:</span>
                  <p className="mt-1">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Tickets */}
          {order.tickets && order.tickets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Support Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.tickets.map((ticket) => (
                    <Link
                      key={ticket.id}
                      href={`/tickets/${ticket.id}`}
                      className="block p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      <p className="font-medium">{ticket.category}</p>
                      <p className="text-sm text-gray-500">{ticket.description}</p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}

