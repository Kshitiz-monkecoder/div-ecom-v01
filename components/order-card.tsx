"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/language-provider";
import { Order, OrderItem } from "@prisma/client";
import { format } from "date-fns";

interface OrderCardProps {
  order: Order & {
    items: OrderItem[];
  };
}

const statusColors: Record<string, string> = {
  NEW: "bg-amber-100 text-amber-800",
  CONTACTED: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  INSTALLED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export function OrderCard({ order }: OrderCardProps) {
  const { t } = useLanguage();
  const totalAmount = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalInRupees = (totalAmount / 100).toFixed(2);
  const itemCount = order.items.length;
  const statusLabel = t(`orderStatus.${order.status}`);

  return (
    <Link href={`/orders/${order.id}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                ☀️ {order.items[0]?.name || "Order"} — {order.items[0]?.capacity || ""}
              </CardTitle>
              <CardDescription>
                {t("orders.orderNumber")}: #{order.orderNumber}
              </CardDescription>
              {order.deliveryDate && (
                <CardDescription>
                  {t("orders.installationDate")}: {format(new Date(order.deliveryDate), "dd MMM yyyy")}
                </CardDescription>
              )}
            </div>
            <Badge className={statusColors[order.status] || "bg-gray-100 text-gray-800"} variant="secondary">
              {statusLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            <Link href={`/orders/${order.id}`}>
              <Badge variant="outline" className="cursor-pointer">{t("orders.warrantyCard")}</Badge>
            </Link>
            <Badge variant="outline">{t("orders.downloadInvoice")}</Badge>
            <Badge variant="outline">{t("orders.subsidyStatus")}</Badge>
          </div>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">{t("orders.productDetails")}:</span> {itemCount} item(s)
              {itemCount > 0 && ` — ${order.items[0]?.name}${itemCount > 1 ? ` +${itemCount - 1}` : ""}`}
            </p>
            <p><span className="font-medium">Total:</span> ₹{totalInRupees}</p>
            <p><span className="font-medium">Address:</span> {order.address}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
