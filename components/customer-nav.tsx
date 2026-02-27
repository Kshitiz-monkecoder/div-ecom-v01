"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut, LayoutDashboard, HelpCircle, User, Package, Gift, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/components/language-provider";

const navItems = [
  { href: "/", labelKey: "nav.home", icon: Home },
  { href: "/orders", labelKey: "nav.myOrders", icon: Package },
  { href: "/referrals", labelKey: "nav.referral", icon: Gift },
  { href: "/tickets", labelKey: "nav.support", icon: HelpCircle },
  { href: "/account", labelKey: "nav.account", icon: User },
];

const navItemsDesktop = [
  { href: "/", labelKey: "nav.home", icon: Home },
  { href: "/orders", labelKey: "nav.myOrders", icon: Package },
  { href: "/referrals", labelKey: "nav.referralAndTokens", icon: Gift },
  { href: "/tickets", labelKey: "nav.support", icon: HelpCircle },
  { href: "/account", labelKey: "nav.account", icon: User },
];

export function CustomerHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, locale, setLocale } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/check-admin")
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.isAdmin || false))
      .catch(() => setIsAdmin(false));
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleLanguage = () => {
    setLocale(locale === "hi" ? "en" : "hi");
  };

  return (
    <header className="w-full border-b border-border bg-card px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      <Link href="/" className="flex items-center shrink-0">
        <Image
          src="/divy-power-logo.png"
          alt="Divy Power"
          width={140}
          height={52}
          className="h-10 w-auto md:h-12"
          priority
        />
      </Link>

      {/* Desktop: horizontal nav links */}
      <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
        {navItemsDesktop.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "min-h-[48px]",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                <Icon className="h-4 w-4 mr-2" />
                {t(item.labelKey)}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="min-h-[48px] text-muted-foreground hover:text-foreground"
          aria-label="Toggle language"
        >
          {locale === "hi" ? "हिंदी" : "English"}
        </Button>
        {isAdmin && (
          <Button asChild variant="outline" size="sm" className="min-h-[48px]">
            <Link href="/admin">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Admin
            </Link>
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="min-h-[48px] text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {t("nav.signOut")}
        </Button>
      </div>
    </header>
  );
}

export function CustomerNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
    >
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-0 px-1 py-2 text-xs transition-colors",
                isActive ? "text-primary font-medium" : "text-muted-foreground"
              )}
              style={{ minHeight: "48px" }}
            >
              <Icon className="h-6 w-6 shrink-0" />
              <span className="truncate w-full text-center">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
