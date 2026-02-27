"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderCard } from "@/components/order-card";
import { MediaCarousel, type MediaItem } from "@/components/media-carousel";
import { ProductCard } from "@/components/product-card";
import type { Order, OrderItem } from "@prisma/client";
import type { ParsedProduct } from "@/types";

const orderMedia: MediaItem[] = [
  { type: "video", url: "https://res.cloudinary.com/dmk66g4w2/video/upload/v1770089560/Ashish_Jain___Solar_Monitor___Kavinagar___DIVY_POWER_Pvt_Ltd___TATA_Power_Pvt_Ltd_oxmonq.mp4", alt: "Order Update" },
  { type: "video", url: "https://res.cloudinary.com/dmk66g4w2/video/upload/v1770089560/Leading_the_Solar_Charge_A_Deep_Dive_with_the_Minds_Behind_Divy_Power_a8hia3.mp4", alt: "Order Update" },
  { type: "video", url: "https://res.cloudinary.com/dmk66g4w2/video/upload/v1770089559/Innovating_the_Future_of_Solar_Stories_from_UPSIT_2025._lsqcti.mp4", alt: "Order Update" },
  { type: "video", url: "https://res.cloudinary.com/dmk66g4w2/video/upload/v1770089544/wave_city_t0ubfh.mp4", alt: "Order Update" },
];

type OrderWithItems = Order & { items: OrderItem[] };

type OrdersPageClientProps = {
  orders: OrderWithItems[];
  assignedProducts: ParsedProduct[];
};

export function OrdersPageClient({ orders, assignedProducts }: OrdersPageClientProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold">{t("orders.title")}</h1>
          <p className="text-muted-foreground mt-1">Track your orders and access products.</p>
        </div>
        <Button asChild variant="outline" className="min-h-[48px]">
          <Link href="/tickets">{t("home.quickAction3Title")}</Link>
        </Button>
      </div>

      <div className="aspect-video max-w-3xl mx-auto">
        <MediaCarousel items={orderMedia} />
      </div>

      {orders.length > 0 ? (
        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">{t("orders.orderHistory")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>{t("orders.noOrders")}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("orders.noOrdersMessage")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline" className="min-h-[48px]">
                <Link href="/tickets">{t("orders.contactSupport")}</Link>
              </Button>
              <Button asChild className="min-h-[48px]">
                <Link href="/refer">{t("orders.bookConsultation")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {assignedProducts.length > 0 && (
        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Available Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
