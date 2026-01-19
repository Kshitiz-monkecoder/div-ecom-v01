"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import ReferForm from "./ReferForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImageCarousel } from "@/components/product-image-carousel";
import { ChevronLeft, ChevronRight, ShieldCheck, Zap, Clock } from "lucide-react";
import { useSearchParams } from "next/navigation";

type PublicProduct = {
  id: string;
  name: string;
  description: string;
  capacity: string;
  category: "Residential" | "Commercial" | string;
  images: string[];
};

function ProductShowcase({ products }: { products: PublicProduct[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const cards = useMemo(() => products.slice(0, 12), [products]);

  const scrollByCard = (dir: "prev" | "next") => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>("[data-carousel-card]");
    const cardWidth = firstCard?.offsetWidth ?? 320;
    const gap = 16;
    const delta = (cardWidth + gap) * (dir === "next" ? 1 : -1);
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  if (cards.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Our solar solutions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Products will appear here once they’re added in the admin panel.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">Popular options</h2>
          <Badge variant="secondary">No prices shown</Badge>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => scrollByCard("prev")}
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => scrollByCard("next")}
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 pr-2"
      >
        {cards.map((p) => (
          <Card
            key={p.id}
            data-carousel-card
            className="min-w-[280px] sm:min-w-[320px] snap-start overflow-hidden"
          >
            <div className="relative h-40 bg-muted">
              {p.images?.length ? (
                <ProductImageCarousel images={p.images} alt={p.name} className="object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                  No image
                </div>
              )}
            </div>

            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold leading-snug">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.capacity}</div>
                </div>
                <Badge variant="outline">{p.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-2 text-xs text-muted-foreground sm:hidden">
        Swipe to browse.
      </p>
    </div>
  );
}

export default function ReferLanding() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("code");
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/public/products");
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setProducts(data);
        }
      } catch {
        // ignore; we'll show fallback UI
      } finally {
        setLoadingProducts(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-orange-50 via-white to-white">
      <header className="border-b bg-white/70 backdrop-blur supports-backdrop-filter:bg-white/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/divy-power-logo.png"
              alt="Divy Power"
              width={150}
              height={48}
              className="h-10 w-auto"
              priority
            />
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Welcome
            </Badge>
          </div>
          <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Trusted installation & support
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Quick follow‑up
            </span>
            <span className="inline-flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Residential & commercial
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <section className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Divy Power</Badge>
                {referralCode ? (
                  <Badge variant="secondary" className="font-mono">
                    Referred: {referralCode}
                  </Badge>
                ) : (
                  <Badge variant="secondary">Referral link missing code</Badge>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                You’ve been referred for a solar consultation.
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                Please fill in your details and what kind of solar solution you’re looking for.
                Divy Power will contact you to understand your site requirements and recommend the
                right system.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium">1. Share your requirement</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Tell us what you need (residential or commercial).
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium">2. We contact you</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Our team calls to confirm details & feasibility.
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium">3. Get a proposal</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    System recommendation & next steps.
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Products we offer</h2>
                {loadingProducts ? (
                  <span className="text-xs text-muted-foreground">Loading…</span>
                ) : null}
              </div>
              <ProductShowcase products={products} />
            </div>
          </section>

          <aside className="lg:sticky lg:top-8">
            <Card className="shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle>Solar requirement form</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Fill your details and requirement. We’ll contact you shortly.
                </p>
              </CardHeader>
              <CardContent>
                <ReferForm />
                <p className="mt-4 text-xs text-muted-foreground">
                  By submitting, you agree that Divy Power may contact you using the details you
                  provide here.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}

