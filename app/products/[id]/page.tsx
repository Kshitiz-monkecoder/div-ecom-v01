import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BatteryCharging, Gauge, ShieldCheck, SunMedium } from "lucide-react";
import { getProduct } from "@/app/actions/products";
import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImageCarousel } from "@/components/product-image-carousel";
import { getCurrentUser } from "@/lib/auth";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  const user = await getCurrentUser();

  if (!product) {
    notFound();
  }

  const priceInRupees = (product.price / 100).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

  const specs = [
    product.capacity && { label: "System capacity", value: product.capacity, icon: Gauge },
    product.solarBrand && { label: "Panel brand", value: product.solarBrand, icon: SunMedium },
    product.inverter && { label: "Inverter", value: product.inverter, icon: BatteryCharging },
    product.systemType && { label: "System type", value: product.systemType, icon: ShieldCheck },
  ].filter(Boolean) as { label: string; value: string; icon: typeof Gauge }[];

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f5f8f2_0%,#e9f4ee_45%,#f8f2e5_100%)] text-orange-900">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <Button asChild variant="ghost" className="mb-6 rounded-full text-muted-foreground hover:bg-white/70 hover:text-orange-900">
          <Link href="/orders">
            <ArrowLeft className="size-4" />
            Back to products
          </Link>
        </Button>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.8fr)]">
          <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 p-3 shadow-[0_24px_90px_-54px_rgba(15,23,42,0.7)] backdrop-blur-xl">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-slate-100">
              {product.images.length > 0 ? (
                <ProductImageCarousel images={product.images} alt={product.name} />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                  No image available
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_24px_90px_-54px_rgba(15,23,42,0.7)] backdrop-blur-xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-orange-800 shadow-none hover:bg-emerald-100">
                  {product.category}
                </Badge>
                {product.capacity && (
                  <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-3 py-1">
                    {product.capacity}
                  </Badge>
                )}
              </div>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-orange-900 sm:text-5xl">{product.name}</h1>
              <p className="mt-4 text-3xl font-semibold text-orange-900">Rs {priceInRupees}</p>
              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-muted-foreground">{product.description}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="h-11 rounded-full bg-primary px-5 text-white hover:bg-slate-800">
                  <Link href={user ? "/orders" : "/login"}>
                    {user ? "View assigned orders" : "Sign in to continue"}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-full border-slate-200 bg-white px-5">
                  <Link href="/refer">Request quotation</Link>
                </Button>
              </div>
            </div>

            {specs.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {specs.map((spec) => {
                  const Icon = spec.icon;
                  return (
                    <div key={spec.label} className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
                      <Icon className="size-5 text-orange-600" />
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{spec.label}</p>
                      <p className="mt-1 text-sm font-semibold text-orange-900">{spec.value}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
