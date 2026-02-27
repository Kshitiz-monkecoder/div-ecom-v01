import { getUserOrders } from "@/app/actions/orders";
import { getProducts } from "@/app/actions/products";
import CustomerLayout from "@/components/customer-layout";
import { OrdersPageClient } from "@/components/orders-page-client";
import { requireAuth } from "@/lib/proxy";
import { ParsedProduct } from "@/types";

export default async function OrdersPage() {
  const [, orders, assignedProducts] = await Promise.all([
    requireAuth(),
    getUserOrders(),
    getProducts(),
  ]);

  return (
    <CustomerLayout>
      <OrdersPageClient
        orders={orders}
        assignedProducts={(assignedProducts || []) as ParsedProduct[]}
      />
    </CustomerLayout>
  );
}
