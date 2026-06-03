import { redirect } from "next/navigation";
import { HomePageClient } from "@/components/home-page-client";
import { getUserOrders } from "@/app/actions/orders";
import { requireAuth } from "@/lib/proxy";
import { Role } from "@/types";
import { LanguageProvider } from "@/components/language-provider";

export default async function Home() {
  const user = await requireAuth();

  if (user.role === Role.ADMIN) {
    redirect("/admin");
  }

  const orders = await getUserOrders();
  const ordersSummary = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    deliveryDate: o.deliveryDate ? new Date(o.deliveryDate).toISOString() : null,
    items: (o.items ?? []).map((i: any) => ({ name: i.name, capacity: i.capacity })),
  }));

  return (
    <LanguageProvider>
      <HomePageClient
        userName={user.name}
        referralCode={user.referralCode ?? ""}
        orders={ordersSummary}
      />
    </LanguageProvider>
  );
}