import Link from "next/link";
import { ArrowRight, BatteryCharging, Gauge, ShieldCheck, SunMedium } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ParsedProduct } from "@/types";
import { SafeImage } from "@/components/safe-image";

interface ProductCardProps {
  product: ParsedProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const priceInRupees = (product.price / 100).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
  const specs = [
    product.capacity && { label: "Capacity", value: product.capacity, icon: Gauge },
    product.solarBrand && { label: "Panel", value: product.solarBrand, icon: SunMedium },
    product.inverter && { label: "Inverter", value: product.inverter, icon: BatteryCharging },
  ].filter(Boolean) as { label: string; value: string; icon: typeof Gauge }[];

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/90 shadow-sm transition-all hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_70px_-42px_rgba(15,23,42,0.75)] customer-focus-ring"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {product.images.length > 0 ? (
          <SafeImage
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            No product image
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/55 to-transparent" />
        <Badge className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-slate-700 shadow-none hover:bg-white">
          {product.category}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-orange-900">{product.name}</h3>
            <p className="mt-1 text-sm font-medium text-orange-600">{product.capacity}</p>
          </div>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-orange-600">
            <ShieldCheck className="size-5" />
          </span>
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{product.description}</p>

        {specs.length > 0 && (
          <div className="mt-5 grid gap-2">
            {specs.slice(0, 3).map((spec) => {
              const Icon = spec.icon;
              return (
                <div key={spec.label} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs">
                  <Icon className="size-3.5 text-slate-400" />
                  <span className="font-medium text-slate-500">{spec.label}</span>
                  <span className="ml-auto truncate text-slate-800">{spec.value}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
          <div>
            <p className="text-xs text-slate-400">Estimated value</p>
            <p className="text-lg font-semibold text-orange-900">Rs {priceInRupees}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600">
            Details
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
