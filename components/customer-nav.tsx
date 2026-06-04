"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Box,
  ChevronDown,
  ClipboardList,
  Globe,
  Headphones,
  Home,
  LayoutDashboard,
  Menu,
  Package,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

const navItems = [
  { href: "/",           labelKey: "nav.home",    label: "Home",               icon: Home,          badge: undefined },
  { href: "/orders",     labelKey: "nav.myOrders", label: "My Orders",         icon: Package,       badge: undefined },
  { href: "/orders/new", labelKey: "nav.newOrder", label: "New Order",         icon: Box,           badge: undefined    },
  { href: "/tickets",    labelKey: "nav.helpSupport",  label: "Help & Support",     icon: ClipboardList, badge: undefined },
  { href: "/referrals",  labelKey: "nav.referralRewards", label: "Referral & Rewards",icon: Users,         badge: undefined },
  { href: "/account",    labelKey: "nav.account",  label: "Account",           icon: User,          badge: undefined },
];

function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    fetch("/api/check-admin")
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.isAdmin || false))
      .catch(() => setIsAdmin(false));
  }, []);
  return isAdmin;
}

function useUserInfo() {
  const [info, setInfo] = useState<{ name: string; phone: string } | null>(null);
  useEffect(() => {
    fetch("/api/check-admin")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setInfo({ name: d.user.name ?? "User", phone: d.user.phone ?? "" });
      })
      .catch(() => {});
  }, []);
  return info;
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/orders/new") return pathname === "/orders/new";
  if (href === "/orders") return pathname.startsWith("/orders") && pathname !== "/orders/new";
  return pathname.startsWith(href);
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

// ─── Sidebar ───────────────────────────────────────────────────────────────
export function CustomerSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="hidden xl:flex flex-col w-[220px] shrink-0 sticky top-0 h-screen bg-white border-r border-gray-100 py-6 px-3 overflow-hidden">
      {/* Logo */}
      <div className="px-3 mb-8">
        <Image
          src="/divy-power-logo.png"
          alt="Divy Power"
          width={110}
          height={38}
          className="h-9 w-auto"
          priority
        />
        <p className="text-[10px] text-gray-400 mt-1">Solar operations, made simple</p>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              )}
            >
              <Icon className="size-4 shrink-0" />
                <span className="flex-1">{t(item.labelKey)}</span>
              {item.badge && (
                <span className="text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Support footer */}
      <div className="mt-auto pt-4 px-3 pb-2">
        <div className="rounded-xl bg-orange-50 border border-orange-100 p-3">
         <p className="text-xs font-semibold text-orange-900">{t("nav.needHelp")}</p>
<p className="text-[11px] text-orange-600 mt-0.5">{t("nav.supportHours")}</p>
          <Link
            href="/tickets/new"
            className="mt-2 block w-full text-center text-xs font-bold bg-orange-500 text-white py-1.5 rounded-lg hover:bg-orange-600 transition-colors"
          >
            {t("nav.contactSupport")}
          </Link>
        </div>
      </div>
    </aside>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────
export function CustomerHeader() {
  const router = useRouter();
  const isAdmin = useAdminStatus();
  const userInfo = useUserInfo();
  const { locale, setLocale, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {}
  };

  const firstName = userInfo?.name?.split(" ")[0] ?? "User";
  const avatarLabel = userInfo ? getInitials(userInfo.name) : "U";

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between">
      {/* Left: mobile logo / desktop portal label */}
      <div className="flex items-center gap-2">
        <Image
          src="/divy-power-logo.png"
          alt="Divy Power"
          width={88}
          height={30}
          className="h-7 w-auto xl:hidden"
          priority
        />
        <div className="hidden xl:block">
          <p className="text-sm font-semibold text-gray-800">Customer Portal</p>
          <p className="text-xs text-gray-400">Solar operations, made simple</p>
        </div>
      </div>

      {/* Right: language, bell, user */}
      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <button
          onClick={() => setLocale(locale === "hi" ? "en" : "hi")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Globe className="size-3.5" />
          {locale === "hi" ? t("nav.english") : t("nav.hindi")}
        </button>

        {/* Bell */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Bell className="size-4 text-gray-500" />
          <span className="absolute top-1 right-1 size-2 bg-orange-500 rounded-full" />
        </button>

        {/* Avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-gray-50 transition-colors"
          >
            <div className="size-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold select-none">
              {avatarLabel}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-800 leading-tight">{t("nav.hiUser", { name: firstName })}</p>
              <p className="text-[11px] text-gray-400 leading-tight">{userInfo?.phone ?? ""}</p>
            </div>
            <ChevronDown className="size-3.5 text-gray-400 hidden sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-gray-100 bg-white py-1 shadow-lg z-50">
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <User className="size-4 text-gray-400" />
                {t("nav.myAccount")}
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <LayoutDashboard className="size-4 text-gray-400" />
                  {t("nav.adminPanel")}
                </Link>
              )}
              <div className="my-1 border-t border-gray-100" />
              <button
                onClick={() => { setMenuOpen(false); handleSignOut(); }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                {t("nav.signOut")}
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="flex size-9 items-center justify-center rounded-full hover:bg-gray-100 xl:hidden">
          <Menu className="size-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
}

// ─── Mobile bottom nav ─────────────────────────────────────────────────────
export function CustomerMobileNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const mobileItems = navItems.filter((i) => i.href !== "/orders/new");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-100 bg-white px-2 pt-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] xl:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)" }}
    >
      <div className="grid h-14 grid-cols-5 gap-0.5">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-medium transition-colors",
                active ? "text-orange-600" : "text-gray-400 hover:text-gray-700"
              )}
            >
              <span className={cn(
                "flex size-7 items-center justify-center rounded-lg transition-colors",
                active ? "bg-orange-100" : ""
              )}>
                <Icon className="size-4 shrink-0" />
              </span>
              <span className="w-full truncate text-center leading-none">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}