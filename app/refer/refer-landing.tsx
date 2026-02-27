"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import ReferForm from "./ReferForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImageCarousel } from "@/components/product-image-carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

const SUBSIDY_AMOUNT = 78000;
const BILL_TO_SAVINGS_RATIO = 0.95; // approximate monthly savings = bill * 0.95

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
    <Card className="border-2 border-[#27AE60]/30">
      <CardHeader>
        <CardTitle className="text-lg">💰 देखें, आप कितना बचा सकते हैं!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">आपका मासिक बिजली बिल: ₹{monthlyBill}</label>
          <input
            type="range"
            min="500"
            max="15000"
            step="500"
            value={monthlyBill}
            onChange={(e) => setMonthlyBill(Number(e.target.value))}
            className="w-full mt-2 h-3 rounded-lg appearance-none bg-muted accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>₹500</span>
            <span>₹15,000</span>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-[#27AE60] font-bold text-lg">
            आपकी मासिक बचत: ₹{monthlySavings.toLocaleString("en-IN")}
          </p>
          <p>सालाना बचत: ₹{yearlySavings.toLocaleString("en-IN")}</p>
          <p>25 साल में कुल बचत: ₹{twentyFiveYearSavings.toLocaleString("en-IN")}</p>
          <p>सब्सिडी: ₹{SUBSIDY_AMOUNT.toLocaleString("en-IN")} (सीधे बैंक में)</p>
          <p>आपको लगाना होगा (सब्सिडी के बाद): ~₹{(payAfterSubsidy / 100000).toFixed(1)} लाख</p>
          <p>Payback period: ~{paybackYears} साल</p>
        </div>
      </CardContent>
    </Card>
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
      <Card className="border-dashed">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          प्रोडक्ट जल्द ही जोड़े जाएंगे।
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-base font-semibold">हमारे प्रोडक्ट</h2>
        <div className="hidden sm:flex items-center gap-2">
          <Button type="button" variant="outline" size="icon" onClick={() => scrollByCard("prev")} aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={() => scrollByCard("next")} aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div ref={scrollerRef} className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 pr-2">
        {cards.map((p) => (
          <Card key={p.id} data-carousel-card className="min-w-[280px] sm:min-w-[320px] snap-start overflow-hidden">
            <div className="relative h-40 bg-muted">
              {p.images?.length ? (
                <ProductImageCarousel images={p.images} alt={p.name} className="object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
              )}
            </div>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold leading-snug">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.capacity}</div>
                </div>
              </div>
              {p.price != null && p.price > 0 && (
                <p className="text-[#27AE60] font-semibold">
                  ₹{(p.price / 100).toLocaleString("en-IN")}
                  {p.price / 100 >= SUBSIDY_AMOUNT && (
                    <span className="text-xs font-normal text-muted-foreground"> (सब्सिडी के बाद ~₹{Math.round((p.price / 100 - SUBSIDY_AMOUNT) / 1000)}K)</span>
                  )}
                </p>
              )}
              <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const TESTIMONIALS = [
  { text: "पहले बिल ₹5,000 आता था, अब ₹200 आता है। दिव्य पावर ने बहुत अच्छा काम किया।", name: "राजेश शर्मा", location: "इंदिरापुरम, गाजियाबाद", stars: 5 },
  { text: "सब्सिडी भी टाइम पर आ गई। टीम बहुत helpful है।", name: "प्रीति गुप्ता", location: "वसुंधरा, गाजियाबाद", stars: 5 },
];

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
        if (res.ok && Array.isArray(data)) setProducts(data);
      } catch {
        // ignore
      } finally {
        setLoadingProducts(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      <header className="border-b border-border bg-card/90 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Image src="/divy-power-logo.png" alt="Divy Power" width={150} height={48} className="h-10 w-auto" priority />
          <Badge variant="secondary">PM सूर्य घर योजना पार्टनर</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-10">
        {/* Hero */}
        <section className="rounded-2xl bg-linear-to-b from-[#FF9933]/20 via-white to-[#138808]/20 border border-border p-6 md:p-8 text-center">
          <p className="text-3xl mb-2">☀️</p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">PM सूर्य घर मुफ्त बिजली योजना</h1>
          <p className="text-xl font-semibold text-[#27AE60] mt-2">बिजली का बिल ₹0 करें!</p>
          <p className="text-foreground mt-1">सरकार दे रही है ₹78,000 तक की सब्सिडी</p>
          <ul className="mt-4 text-sm text-foreground space-y-1">
            <li>✅ 2,000+ परिवार पहले ही लगवा चुके हैं</li>
            <li>✅ UPNEDA अधिकृत कंपनी</li>
            <li>✅ 25 साल की वारंटी</li>
          </ul>
          {referralCode && (
            <p className="mt-4 text-sm font-medium text-primary">
              आपके दोस्त ने आपको रेफर किया है! 🎁 स्पेशल डिस्काउंट उपलब्ध
            </p>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
            <SavingsCalculator />
            <div>
              <h2 className="text-lg font-semibold mb-4">कैसे काम करता है?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card><CardContent className="p-4"><p className="font-medium">1️⃣ फॉर्म भरें</p><p className="text-xs text-muted-foreground mt-1">हमारी टीम 24 घंटे में कॉल करेगी</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="font-medium">2️⃣ फ्री सर्वे</p><p className="text-xs text-muted-foreground mt-1">टेक्नीशियन आपकी छत देखने आएगा (₹0)</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="font-medium">3️⃣ इंस्टॉल</p><p className="text-xs text-muted-foreground mt-1">3-5 दिन में सोलर लग जाएगा, बिल ₹0!</p></CardContent></Card>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-3">हमारे प्रोडक्ट</h2>
              <ProductShowcase products={products} />
            </div>
            <Card>
              <CardHeader><CardTitle className="text-base">💬 हमारे ग्राहक क्या कहते हैं</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {TESTIMONIALS.map((t, i) => (
                  <div key={i} className="border-l-4 border-primary pl-4">
                    <p className="text-sm">&ldquo;{t.text}&rdquo;</p>
                    <p className="text-xs text-muted-foreground mt-1">— {t.name}, {t.location} {"⭐".repeat(t.stars)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <aside className="lg:sticky lg:top-8 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>📝 फ्री कंसल्टेशन बुक करें</CardTitle>
                <p className="text-sm text-muted-foreground">
                  सबमिट करने पर दिव्य पावर टीम 24 घंटे में आपको कॉल करेगी। आपकी जानकारी सुरक्षित है।
                </p>
              </CardHeader>
              <CardContent>
                <ReferForm referralCode={referralCode} />
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-2">
              <Card><CardContent className="p-3 text-center text-sm font-medium">2,000+ इंस्टॉल</CardContent></Card>
              <Card><CardContent className="p-3 text-center text-sm font-medium">₹78,000 सब्सिडी</CardContent></Card>
              <Card><CardContent className="p-3 text-center text-sm font-medium">25 साल वारंटी</CardContent></Card>
              <Card><CardContent className="p-3 text-center text-sm font-medium">4.8 ⭐ रेटिंग</CardContent></Card>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
