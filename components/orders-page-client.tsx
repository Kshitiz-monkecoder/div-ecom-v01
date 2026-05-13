"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Headphones, Package, Search, ShieldCheck, SlidersHorizontal, SunMedium, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderCard } from "@/components/order-card";
import { MediaCarousel, type MediaItem } from "@/components/media-carousel";
import { ProductCard } from "@/components/product-card";
import { CustomerCard, CustomerPage, CustomerPageHeader, EmptyState, MetricCard, SectionHeader } from "@/components/customer-portal-ui";
import { formatStatusLabel } from "@/components/customer-status";
import type { Order, OrderItem, ParsedProduct } from "@/types";

const orderMedia: MediaItem[] = [
  { type: "video", url: "https://res.cloudinary.com/dmk66g4w2/video/upload/v1770089560/Ashish_Jain___Solar_Monitor___Kavinagar___DIVY_POWER_Pvt_Ltd___TATA_Power_Pvt_Ltd_oxmonq.mp4", alt: "Solar monitoring update" },
  { type: "video", url: "https://res.cloudinary.com/dmk66g4w2/video/upload/v1770089560/Leading_the_Solar_Charge_A_Deep_Dive_with_the_Minds_Behind_Divy_Power_a8hia3.mp4", alt: "Divy Power story" },
  { type: "video", url: "https://res.cloudinary.com/dmk66g4w2/video/upload/v1770089559/Innovating_the_Future_of_Solar_Stories_from_UPSIT_2025._lsqcti.mp4", alt: "Solar innovation story" },
  { type: "video", url: "https://res.cloudinary.com/dmk66g4w2/video/upload/v1770089544/wave_city_t0ubfh.mp4", alt: "Installation update" },
];

type OrderWithItems = Order & { items: OrderItem[] };

type OrdersPageClientProps = {
  orders: OrderWithItems[];
  assignedProducts: ParsedProduct[];
};

const allStatuses = "ALL";
const allCategories = "ALL";

export function OrdersPageClient({ orders, assignedProducts }: OrdersPageClientProps) {
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(allStatuses);
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(allCategories);

  const statuses = useMemo(() => Array.from(new Set(orders.map((order) => order.status))), [orders]);
  const categories = useMemo(
    () => Array.from(new Set(assignedProducts.map((product) => product.category).filter(Boolean))),
    [assignedProducts]
  );

  const activeOrders = orders.filter((order) => !["INSTALLED", "CANCELLED", "COMPLETED"].includes(order.status)).length;
  const installedOrders = orders.filter((order) => ["INSTALLED", "COMPLETED"].includes(order.status)).length;
  const documentReady = orders.filter((order) => order.warrantyCardUrl || order.invoiceUrl || (order.additionalFiles?.length ?? 0) > 0).length;

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === allStatuses || order.status === statusFilter;
      const searchable = [
        order.orderNumber,
        order.address,
        order.phone,
        ...order.items.flatMap((item) => [item.name, item.capacity || "", item.description || ""]),
      ]
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!q || searchable.includes(q));
    });
  }, [orders, orderSearch, statusFilter]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return assignedProducts.filter((product) => {
      const matchesCategory = categoryFilter === allCategories || product.category === categoryFilter;
      const searchable = [product.name, product.capacity, product.description, product.solarBrand || "", product.inverter || ""]
        .join(" ")
        .toLowerCase();
      return matchesCategory && (!q || searchable.includes(q));
    });
  }, [assignedProducts, productSearch, categoryFilter]);

  return (
    <CustomerPage className="space-y-8">
      <CustomerPageHeader
        eyebrow="Solar operations"
        title="Orders, materials, and assigned products"
        description="Track every customer-side mileorange from order creation to installation, documents, support, and material verification."
        actions={
          <>
            <Button asChild className="h-11 rounded-full bg-primary px-5 text-white hover:bg-slate-800">
              <Link href="/tickets/new">
                <Headphones className="size-4" />
                Need help
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-full border-slate-200 bg-white/80 px-5">
              <Link href="/refer">Request quotation</Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total orders" value={orders.length} icon={<Package className="size-5" />} detail="All assigned solar projects." tone="dark" />
        <MetricCard label="Active projects" value={activeOrders} icon={<Truck className="size-5" />} detail="Still moving through delivery or install." tone="green" />
        <MetricCard label="Installed" value={installedOrders} icon={<SunMedium className="size-5" />} detail="Completed customer installations." tone="solar" />
        <MetricCard label="Documents ready" value={documentReady} icon={<FileText className="size-5" />} detail="Warranty, invoices, or added files." tone="blue" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <CustomerCard className="overflow-hidden p-5">
          <SectionHeader
            title="Order workspace"
            description="Search, filter, and open the project that needs attention."
            action={
              <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
                <SlidersHorizontal className="size-3.5" />
                {filteredOrders.length} shown
              </div>
            }
          />

          <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={orderSearch}
                onChange={(event) => setOrderSearch(event.target.value)}
                placeholder="Search by order, product, address, or phone"
                className="h-12 rounded-full border-slate-200 bg-white pl-11 shadow-none"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setStatusFilter(allStatuses)}
                className={`h-12 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors customer-focus-ring ${
                  statusFilter === allStatuses ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-slate-100"
                }`}
              >
                All
              </button>
              {statuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`h-12 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors customer-focus-ring ${
                    statusFilter === status ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-slate-100"
                  }`}
                >
                  {formatStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <EmptyState
              title={orders.length === 0 ? "No orders yet" : "No matching orders"}
              description={orders.length === 0 ? "Your project orders will appear here after the team assigns them." : "Try a different search term or status filter."}
              action={
                <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-slate-800">
                  <Link href="/tickets/new">Contact support</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </CustomerCard>

        <div className="space-y-6">
          <CustomerCard className="overflow-hidden p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-orange-900">Project stories</h2>
                <p className="text-sm text-slate-500">Customer updates and installation confidence.</p>
              </div>
              <ShieldCheck className="size-5 text-orange-600" />
            </div>
            <MediaCarousel items={orderMedia} className="rounded-2xl" />
          </CustomerCard>

          <CustomerCard className="p-5">
            <h2 className="text-lg font-semibold text-orange-900">What happens next?</h2>
            <div className="mt-4 space-y-3">
              {[
                ["1", "Confirm details", "Review assigned products and order documents."],
                ["2", "Schedule delivery", "Set a preferred delivery window from the order page."],
                ["3", "Verify material", "Approve BOM with OTP when the team enables it."],
              ].map(([step, title, text]) => (
                <div key={step} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-semibold text-orange-900">{step}</span>
                  <div>
                    <p className="text-sm font-semibold text-orange-900">{title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </CustomerCard>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Assigned product browsing"
          description="Explore products currently available to your account. Selection and ordering behavior stays exactly as configured by Divy Power."
          action={<span className="text-sm font-medium text-slate-500">{filteredProducts.length} products</span>}
        />

        <CustomerCard className="mb-5 p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                placeholder="Search by product, capacity, inverter, or panel brand"
                className="h-12 rounded-full border-slate-200 bg-white pl-11 shadow-none"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setCategoryFilter(allCategories)}
                className={`h-12 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors customer-focus-ring ${
                  categoryFilter === allCategories ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-slate-100"
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setCategoryFilter(category)}
                  className={`h-12 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors customer-focus-ring ${
                    categoryFilter === category ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-slate-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </CustomerCard>

        {assignedProducts.length === 0 ? (
          <EmptyState
            title="No assigned products yet"
            description="Products assigned to your account will appear here when they are available."
            icon={<Package className="size-5" />}
          />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title="No matching products"
            description="Try changing your search term or product category."
            icon={<Search className="size-5" />}
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </CustomerPage>
  );
}
