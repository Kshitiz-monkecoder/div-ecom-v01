import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Order } from "@prisma/client";
import { Product } from "@prisma/client";
import { format } from "date-fns";

interface OrderCardProps {
  order: Order & {
    product: Product;
  };
}

export function OrderCard({ order }: OrderCardProps) {
  const priceInRupees = (order.product.price / 100).toFixed(2);

  return (
    <Link href={`/orders/${order.id}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{order.product.name}</CardTitle>
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
              <span className="font-medium">Price:</span> ₹{priceInRupees}
            </p>
            <p className="text-sm">
              <span className="font-medium">Address:</span> {order.address}
            </p>
            <p className="text-sm">
              <span className="font-medium">Phone:</span> {order.phone}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

