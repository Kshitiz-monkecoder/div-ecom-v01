import { getUserOrders } from "@/app/actions/orders";
import { getProducts } from "@/app/actions/products";
import { OrdersPageClient } from "@/components/orders-page-client";
import { requireAuth } from "@/lib/proxy";
import { ParsedProduct } from "@/types";
import { LanguageProvider } from "@/components/language-provider";

export default async function OrdersPage() {
  const [, orders, assignedProducts] = await Promise.all([
    requireAuth(),
    getUserOrders(),
    getProducts(),
  ]);

  return (
    <LanguageProvider>
      <OrdersPageClient
        orders={orders}
        assignedProducts={(assignedProducts || []) as ParsedProduct[]}
      />
    </LanguageProvider>
  );
}