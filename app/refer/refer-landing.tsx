"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BatteryCharging, ChevronLeft, ChevronRight, Gauge, ShieldCheck, SunMedium, Zap } from "lucide-react";
import ReferForm from "./ReferForm";
import { Button } from "@/components/ui/button";
import { ProductImageCarousel } from "@/components/product-image-carousel";

const SUBSIDY_AMOUNT = 78000;
const BILL_TO_SAVINGS_RATIO = 0.95;

type PublicProduct = {
  id: string;
  name: string;
  description: string;
  capacity: string;
  category: string;
  images: string[];
  price?: number;
};

function SavingsCalculator() {
  const [monthlyBill, setMonthlyBill] = useState(3000);
  const monthlySavings = Math.round(monthlyBill * BILL_TO_SAVINGS_RATIO);
  const yearlySavings = monthlySavings * 12;
  const twentyFiveYearSavings = yearlySavings * 25;
  const payAfterSubsidy = Math.max(0, 180000 - SUBSIDY_AMOUNT);
  const paybackYears = payAfterSubsidy > 0 ? (payAfterSubsidy / yearlySavings).toFixed(1) : "0";

  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_24px_90px_-54px_rgba(15,23,42,0.65)] backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-orange-600">
          <Zap className="size-6" />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-orange-900">Estimate solar savings</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Move the slider to estimate your savings from rooftop solar.</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-semibold text-slate-700">Monthly electricity bill</label>
          <span className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-white">Rs {monthlyBill.toLocaleString("en-IN")}</span>
        </div>
        <input
          type="range"
          min="500"
          max="15000"
          step="500"
          value={monthlyBill}
          onChange={(e) => setMonthlyBill(Number(e.target.value))}
          className="mt-4 w-full"
        />
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>Rs 500</span>
          <span>Rs 15,000</span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <SavingStat label="Monthly savings" value={`Rs ${monthlySavings.toLocaleString("en-IN")}`} highlight />
        <SavingStat label="Yearly savings" value={`Rs ${yearlySavings.toLocaleString("en-IN")}`} />
        <SavingStat label="25-year savings" value={`Rs ${twentyFiveYearSavings.toLocaleString("en-IN")}`} />
        <SavingStat label="Estimated payback" value={`${paybackYears} years`} />
      </div>
    </section>
  );
}

function SavingStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${highlight ? "bg-emerald-700 text-white" : "bg-slate-50 text-orange-900"}`}>
      <p className={`text-xs font-medium ${highlight ? "text-white/65" : "text-slate-500"}`}>{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

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
      <div className="rounded-[2rem] border border-dashed border-orange-200 bg-white/70 p-8 text-center text-sm text-slate-500">
        Products will appear here soon.
      </div>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-orange-900">Solar systems and materials</h2>
          <p className="mt-1 text-sm text-muted-foreground">Explore products used across Divy Power solar projects.</p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Button type="button" variant="outline" size="icon" onClick={() => scrollByCard("prev")} aria-label="Previous" className="rounded-full bg-white">
            <ChevronLeft className="size-4" />
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={() => scrollByCard("next")} aria-label="Next" className="rounded-full bg-white">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
      <div ref={scrollerRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2">
        {cards.map((product) => (
          <article key={product.id} data-carousel-card className="min-w-[290px] snap-start overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/90 shadow-sm sm:min-w-[340px]">
            <div className="relative h-48 bg-slate-100">
              {product.images?.length ? (
                <ProductImageCarousel images={product.images} alt={product.name} className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No image</div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="line-clamp-2 font-semibold leading-snug text-orange-900">{product.name}</h3>
                  <p className="mt-1 text-sm font-medium text-orange-600">{product.capacity}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-muted-foreground">{product.category}</span>
              </div>
              {product.price != null && product.price > 0 && (
                <p className="mt-4 text-lg font-semibold text-orange-900">
                  Rs {(product.price / 100).toLocaleString("en-IN")}
                </p>
              )}
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{product.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function ReferLanding() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("code");
  const [products, setProducts] = useState<PublicProduct[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/public/products");
        const data = await res.json();
        if (res.ok && Array.isArray(data)) setProducts(data);
      } catch {
        /* non-fatal */
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f5f8f2_0%,#e9f4ee_45%,#f8f2e5_100%)] text-orange-900">
      <header className="sticky top-0 z-50 border-b border-white/70 bg-white/90 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Image src="/divy-power-logo.png" alt="Divy Power" width={148} height={52} className="h-10 w-auto" priority />
          <a href="#consultation" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Book consultation
          </a>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/backgrounds/Nature Meets Technology.png"
              alt="Solar technology and nature"
              fill
              className="object-cover opacity-45"
              priority
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,248,242,0.96),rgba(245,248,242,0.82)_54%,rgba(245,248,242,0.35))]" />
          </div>

          <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:px-8">
            <div className="max-w-3xl">
              {referralCode && (
                <p className="mb-5 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-800">
                  Referral code applied
                </p>
              )}
              <h1 className="text-4xl font-semibold tracking-tight text-orange-900 sm:text-6xl">
                Cut electricity bills with a premium rooftop solar system.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700">
                Divy Power helps customers move from enquiry to survey, subsidy guidance, installation, and long-term support with a clean customer-first experience.
              </p>
              <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
                <HeroStat icon={<ShieldCheck className="size-5" />} value="Rs 78k" label="Subsidy guidance" />
                <HeroStat icon={<Gauge className="size-5" />} value="95%" label="Potential bill savings" />
                <HeroStat icon={<BatteryCharging className="size-5" />} value="25 yr" label="Panel life" />
              </div>
              <a href="#consultation" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                Start free consultation
                <ArrowRight className="size-4" />
              </a>
            </div>

            <aside id="consultation" className="scroll-mt-24 rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_28px_100px_-58px_rgba(15,23,42,0.75)] backdrop-blur-xl">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">Free consultation</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-orange-900">Book your solar survey</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Submit your details and the Divy Power team will contact you.</p>
              </div>
              <ReferForm referralCode={referralCode} />
            </aside>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
          <div className="space-y-10">
            <SavingsCalculator />
            <ProductShowcase products={products} />
          </div>
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <ProcessCard step="01" title="Share details" text="Submit your electricity bill range, location, and contact information." />
            <ProcessCard step="02" title="Free survey" text="The team validates site feasibility and system sizing." />
            <ProcessCard step="03" title="Install and support" text="Move through installation, documents, and customer support." />
          </aside>
        </section>
      </main>
    </div>
  );
}

function HeroStat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100 text-orange-600">{icon}</div>
      <p className="mt-4 text-2xl font-semibold text-orange-900">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}

function ProcessCard({ step, title, text }: { step: string; title: string; text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/80 bg-white/90 p-5 shadow-sm">
      <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">{step}</span>
      <h3 className="mt-4 text-lg font-semibold text-orange-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
