"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Gift,
  Headphones,
  Home,
  LayoutDashboard,
  LogOut,
  Package,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

const navItems = [
  { href: "/", labelKey: "nav.home", label: "Dashboard", icon: Home },
  { href: "/orders", labelKey: "nav.myOrders", label: "Orders", icon: Package },
  { href: "/referrals", labelKey: "nav.referral", label: "Referrals", icon: Gift },
  { href: "/tickets", labelKey: "nav.support", label: "Support", icon: Headphones },
  { href: "/account", labelKey: "nav.account", label: "Account", icon: User },
];

function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/check-admin")
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.isAdmin || false))
      .catch(() => setIsAdmin(false));
  }, []);

  return isAdmin;
}

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function CustomerHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = useAdminStatus();
  const { t, locale, setLocale } = useLanguage();

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/90 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 w-full max-w-410 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 rounded-2xl customer-focus-ring">
          <Image
            src="/divy-power-logo.png"
            alt="Divy Power"
            width={132}
            height={46}
            className="h-10 w-auto"
            priority
          />
          <div className="hidden border-l border-slate-200 pl-3 lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">Customer portal</p>
            <p className="text-xs text-slate-500">Solar operations, made simple</p>
          </div>
        </Link>

        <nav className="ml-4 hidden flex-1 items-center justify-center gap-1 xl:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all customer-focus-ring",
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_12px_30px_-18px_rgba(15,23,42,0.85)]"
                    : "text-muted-foreground hover:bg-slate-100 hover:text-stone-900"
                )}
              >
                <Icon className="size-4" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden size-10 rounded-full text-muted-foreground hover:bg-slate-100 sm:inline-flex"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLocale(locale === "hi" ? "en" : "hi")}
            className="h-10 rounded-full border-slate-200 bg-white/80 px-4 text-slate-700 shadow-none hover:bg-slate-50"
            aria-label="Toggle language"
          >
            {locale === "hi" ? "Hindi" : "English"}
          </Button>
          {isAdmin && (
            <Button asChild variant="outline" size="sm" className="hidden h-10 rounded-full border-slate-200 bg-white/80 shadow-none sm:inline-flex">
              <Link href="/admin">
                <LayoutDashboard className="size-4" />
                Admin
              </Link>
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="size-10 rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-700"
            aria-label={t("nav.signOut")}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export function CustomerSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-5.75rem)] w-70 shrink-0 self-start px-3 py-5 xl:block">
      <div className="customer-portal-surface flex h-full flex-col rounded-[2rem] border border-white/75 p-3 shadow-[0_24px_90px_-58px_rgba(15,23,42,0.65)] backdrop-blur-2xl">
        <div className="rounded-[1.35rem] bg-primary p-4 text-white">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-orange-200">Divy Power</p>
          <p className="mt-2 text-lg font-semibold tracking-tight">Your solar workspace</p>
          <p className="mt-2 text-xs leading-5 text-white/65">Track materials, documents, support, and referral rewards in one calm view.</p>
        </div>

        <nav className="mt-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex min-h-12 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition-all customer-focus-ring",
                  active
                    ? "bg-white text-stone-900 shadow-[0_16px_40px_-26px_rgba(15,23,42,0.75)]"
                    : "text-muted-foreground hover:bg-white/70 hover:text-stone-900"
                )}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl transition-colors",
                    active ? "bg-emerald-100 text-orange-600" : "bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-orange-600"
                  )}
                >
                  <Icon className="size-4" />
                </span>
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[1.25rem] border border-orange-100 bg-orange-50/80 p-4">
          <p className="text-sm font-semibold text-orange-950">Support hours</p>
          <p className="mt-1 text-xs leading-5 text-orange-800/75">Mon-Sat, 9:00 AM to 6:00 PM</p>
          <Link href="/tickets/new" className="mt-3 inline-flex text-sm font-semibold text-orange-800 customer-focus-ring">
            Create a ticket
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function CustomerMobileNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/70 bg-white/90 px-2 pt-2 shadow-[0_-24px_60px_-44px_rgba(15,23,42,0.75)] backdrop-blur-2xl xl:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)" }}
    >
      <div className="grid h-16 grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-medium transition-all customer-focus-ring",
                active ? "bg-primary text-primary-foreground" : "text-slate-500 hover:bg-slate-100 hover:text-stone-900"
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="w-full truncate text-center">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
