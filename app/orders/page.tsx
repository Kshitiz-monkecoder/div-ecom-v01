import { getUserOrders } from "@/app/actions/orders";
import { getProducts } from "@/app/actions/products";
import CustomerLayout from "@/components/customer-layout";
import { PageHeader } from "@/components/page-header";
import { ProductCard } from "@/components/product-card";
import { OrderCard } from "@/components/order-card";
import { MediaCarousel, type MediaItem } from "@/components/media-carousel";
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
  const orderMedia: MediaItem[] = [
    {
      type: "video",
      url: "https://res.cloudinary.com/dmk66g4w2/video/upload/v1770089560/Ashish_Jain___Solar_Monitor___Kavinagar___DIVY_POWER_Pvt_Ltd___TATA_Power_Pvt_Ltd_oxmonq.mp4",
      alt: "Order Update",
    },{
      type: "video",
      url: "https://res.cloudinary.com/dmk66g4w2/video/upload/v1770089560/Leading_the_Solar_Charge_A_Deep_Dive_with_the_Minds_Behind_Divy_Power_a8hia3.mp4",
      alt: "Order Update",
    },{
      type: "video",
      url: "https://res.cloudinary.com/dmk66g4w2/video/upload/v1770089559/Innovating_the_Future_of_Solar_Stories_from_UPSIT_2025._lsqcti.mp4",
      alt: "Order Update",
    },{
      type: "video",
      url: "https://res.cloudinary.com/dmk66g4w2/video/upload/v1770089544/wave_city_t0ubfh.mp4",
      alt: "Order Update",
    },
  ];

  const hour = new Date().getHours();
  const timeGreeting =
    hour >= 5 && hour < 12 ? "Good morning" :
    hour >= 12 && hour < 17 ? "Good afternoon" :
    hour >= 17 && hour < 21 ? "Good evening" : "Good night";
  const displayName = user.name?.trim() || "there";

  return (
    <CustomerLayout>
      <div className="max-w-6xl">
        <div className="mb-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {timeGreeting}, {displayName}!
          </h1>
          <p className="text-lg text-muted-foreground mt-1">Welcome back.</p>
        </div>

        <div className="mb-8 aspect-video max-w-3xl mx-auto">
          <MediaCarousel items={orderMedia} />
        </div>

        <PageHeader
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

