import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Order, OrderItem } from "@prisma/client";
import { format } from "date-fns";

interface OrderCardProps {
  order: Order & {
    items: OrderItem[];
  };
}

export function OrderCard({ order }: OrderCardProps) {
  const totalAmount = order.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const totalInRupees = (totalAmount / 100).toFixed(2);
  const itemCount = order.items.length;

  return (
    <Link href={`/orders/${order.id}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Order {order.orderNumber}</CardTitle>
              <CardDescription>
                {format(new Date(order.createdAt), "MMM dd, yyyy")}
              </CardDescription>
            </div>
            <StatusBadge status={order.status} type="order" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Products:</span> {itemCount} item
              {itemCount !== 1 ? "s" : ""}
              {itemCount > 0 && (
                <span className="text-gray-500">
                  {" "}
                  - {order.items[0]?.name}
                  {itemCount > 1 && ` + ${itemCount - 1} more`}
                </span>
              )}
            </p>
            <p className="text-sm">
              <span className="font-medium">Total:</span> ₹{totalInRupees}
            </p>
            <p className="text-sm">
              <span className="font-medium">Address:</span> {order.address}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

