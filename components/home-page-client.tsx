"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Gift, HelpCircle, Phone, Sun } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const PHONE_NUMBER = "9310259325";
const WHATSAPP_NUMBER = "919310259325";

type OrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  deliveryDate: string | null;
  items: { name: string; capacity: string }[];
};

type HomePageClientProps = {
  userName: string;
  referralCode: string;
  orders: OrderSummary[];
};

function getGreetingKey(): "greetingMorning" | "greetingAfternoon" | "greetingEvening" | "greetingNight" {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "greetingMorning";
  if (h >= 12 && h < 17) return "greetingAfternoon";
  if (h >= 17 && h < 21) return "greetingEvening";
  return "greetingNight";
}

function getDaysSinceInstall(deliveryDate: string | null): number | null {
  if (!deliveryDate) return null;
  const d = new Date(deliveryDate);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function HomePageClient({ userName, referralCode, orders }: HomePageClientProps) {
  const { t } = useLanguage();
  const [referralsCount, setReferralsCount] = useState(0);
  const [tokensCount, setTokensCount] = useState(0);

  const firstName = userName?.trim().split(/\s+/)[0] || "Customer";
  const greetingKey = getGreetingKey();
  const firstOrder = orders.find((o) => o.deliveryDate);
  const daysSince = firstOrder ? getDaysSinceInstall(firstOrder.deliveryDate) : null;

  useEffect(() => {
    if (!referralCode) return;
    fetch("/api/user/referrals")
      .then((res) => res.json())
      .then((data: { status?: string; tokensAwarded?: number }[]) => {
        if (Array.isArray(data)) {
          const approved = data.filter((r) => r.status === "APPROVED");
          setReferralsCount(approved.length);
          setTokensCount(approved.reduce((s, r) => s + (r.tokensAwarded ?? 0), 0));
        }
      })
      .catch(() => {});
  }, [referralCode]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success(t("toasts.copied"));
  };

  const handleWhatsAppShare = () => {
    const message = `🙏 नमस्ते! मैंने अपने घर पर दिव्य पावर से सोलर पैनल लगवाया है और मेरा बिजली का बिल ₹0 आ रहा है! 🔥

PM सूर्य घर योजना के तहत ₹78,000 की सब्सिडी भी मिलती है।

आप भी फ्री कंसल्टेशन बुक करें:
👉 ${typeof window !== "undefined" ? window.location.origin : ""}/refer?code=${referralCode}

मेरा रेफरल कोड: ${referralCode}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    toast.success(t("toasts.referralShared"));
  };

  const systemCapacity = firstOrder?.items?.[0]?.capacity ?? "—";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Section 1: Hero greeting */}
      <section className="rounded-2xl bg-linear-to-br from-[#E67E22] via-[#F39C12] to-[#FDEBD0] p-6 md:p-8 text-white shadow-lg">
        <p className="text-lg md:text-xl opacity-95">
          🙏 {t(`home.${greetingKey}`)}{t("home.greetingSuffix", { name: firstName })}
        </p>
        <p className="text-xl md:text-2xl font-semibold mt-2">
          {t("home.helpQuestion")}
        </p>
        <p className="text-sm mt-2 opacity-90">
          {t("home.welcomeSubtext")}
        </p>
        {daysSince != null && daysSince >= 0 && (
          <p className="mt-3 text-base font-medium">
            {t("home.daysSinceInstall", { days: String(daysSince) })}
          </p>
        )}
      </section>

      {/* Section 2: Quick actions */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            href: "/orders",
            icon: Package,
            titleKey: "home.quickAction1Title",
            descKey: "home.quickAction1Desc",
            accent: "border-l-4 border-l-[#E67E22]",
          },
          {
            href: "/referrals",
            icon: Gift,
            titleKey: "home.quickAction2Title",
            descKey: "home.quickAction2Desc",
            accent: "border-l-4 border-l-[#27AE60]",
          },
          {
            href: "/tickets",
            icon: HelpCircle,
            titleKey: "home.quickAction3Title",
            descKey: "home.quickAction3Desc",
            accent: "border-l-4 border-l-[#3498DB]",
          },
          {
            href: `tel:+91${PHONE_NUMBER}`,
            icon: Phone,
            titleKey: "home.quickAction4Title",
            descKey: "home.quickAction4Desc",
            accent: "border-l-4 border-l-[#E74C3C]",
            external: true,
          },
        ].map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <Icon className="h-8 w-8 mb-2 text-muted-foreground" />
              <p className="font-semibold text-sm md:text-base">{t(item.titleKey)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t(item.descKey)}</p>
            </>
          );
          const className = `rounded-xl bg-card border border-border p-4 shadow-sm hover:shadow-md transition-all hover:scale-[0.98] active:scale-[0.97] ${item.accent}`;
          if (item.external) {
            return (
              <a key={item.href} href={item.href} className={className}>
                {content}
              </a>
            );
          }
          return (
            <Link key={item.href} href={item.href} className={className}>
              {content}
            </Link>
          );
        })}
      </section>

      {/* Section 3: Solar summary (if has orders) */}
      {firstOrder ? (
        <Card className="border-2 border-[#27AE60]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-[#27AE60]" />
              {t("home.yourSolarSystem")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              {t("home.system")}: {systemCapacity} | {t("home.installedOn")}:{" "}
              {firstOrder.deliveryDate
                ? new Date(firstOrder.deliveryDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </p>
            <p className="text-sm text-[#27AE60] font-semibold">
              {t("home.monthlySavings", { amount: "3,200" })} (placeholder)
            </p>
            <p className="text-sm text-[#27AE60] font-semibold">
              {t("home.totalSavings", { amount: "12,800" })} (placeholder)
            </p>
            <p className="text-sm">
              {t("home.subsidyStatus")}: ✅ {t("home.subsidyReceived")}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/orders/${firstOrder.id}`}>{t("home.viewWarrantyCard")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`/orders/${firstOrder.id}`}>{t("home.viewDetails")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{t("home.noOrdersYet")}</p>
          </CardContent>
        </Card>
      )}

      {/* Section 4: Referral CTA */}
      <section className="rounded-2xl bg-linear-to-r from-[#E67E22]/90 to-[#F39C12]/90 p-6 text-white shadow-lg">
        <h2 className="text-xl font-bold mb-4">🎁 {t("home.referralBannerTitle")}</h2>
        <p className="text-sm opacity-95">{t("home.yourReferralCode")}</p>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <code className="bg-white/20 px-3 py-2 rounded-lg font-mono text-lg">
            {referralCode || "…"}
          </code>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white text-black hover:bg-white/90"
            onClick={handleCopyCode}
          >
            📋 {t("home.copyCode")}
          </Button>
          <Button
            size="sm"
            className="bg-[#25D366] hover:bg-[#20BD5A] text-white min-h-[48px]"
            onClick={handleWhatsAppShare}
          >
            📤 {t("home.shareOnWhatsApp")}
          </Button>
        </div>
        <p className="text-sm mt-3 opacity-90">
          {t("home.referralsSoFar", { count: String(referralsCount), tokens: String(tokensCount) })}
        </p>
      </section>

      {/* Section 5: Trust badge */}
      <Card className="bg-muted/50 border-border">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-2xl">🇮🇳</span>
            <div>
              <p className="font-semibold text-foreground">{t("home.trustBadge")}</p>
              <p className="text-sm text-muted-foreground">{t("home.trustBadgeSub")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 6: Footer */}
      <footer className="border-t border-border pt-6 pb-8">
        <p className="text-sm font-medium">{t("home.needHelpFooter")}</p>
        <div className="mt-2 text-sm text-muted-foreground space-y-1">
          <p>📞 {t("home.callUs")}</p>
          <p>💬 {t("home.whatsapp")}</p>
          <p>📧 {t("home.email")}</p>
        </div>
      </footer>
    </div>
  );
}
