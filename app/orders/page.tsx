import { getUserOrders } from "@/app/actions/orders";
import { getProducts } from "@/app/actions/products";
import CustomerLayout from "@/components/customer-layout";
import { PageHeader } from "@/components/page-header";
import { ProductCard } from "@/components/product-card";
import { OrderCard } from "@/components/order-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/proxy";
import { ParsedProduct } from "@/types";
import Link from "next/link";

export default async function OrdersPage() {
  const [user, orders, assignedProducts] = await Promise.all([
    requireAuth(),
    getUserOrders(),
    getProducts(),
  ]);

  return (
    <CustomerLayout>
      <div className="max-w-6xl">
        <PageHeader
          greeting={user.name ? `Hi, ${user.name}` : "Hi"}
          title="My Orders"
          subtitle="Track your orders and access products assigned to your account."
          actions={[{ label: "Need help?", href: "/tickets", variant: "outline" }]}
        />

        {/* Orders Section */}
        {orders.length > 0 ? (
          <div className="mb-12">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              Order History
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        ) : (
          <Card className="mb-12">
            <CardHeader className="border-b">
              <CardTitle>Your first order will appear here</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                You haven&apos;t placed any orders yet. If you need help or want
                to raise a request, contact support.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link href="/tickets">Contact support</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assigned Products Section */}
        {assignedProducts.length > 0 && (
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              Available Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignedProducts.map((product: ParsedProduct) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

