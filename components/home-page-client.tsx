"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format, isToday, isTomorrow } from "date-fns";
import {
  ArrowRight,
  Bell,
  Box,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Copy,
  Gift,
  Globe,
  Headphones,
  Home,
  MessageCircle,
  Package,
  Phone,
  Share2,
  ShieldCheck,
  Sun,
  TicketIcon,
  User,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getStatusMeta } from "@/components/customer-status";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  deliveryDate: string | null;
  items: { name: string; capacity: string }[];
}

interface Props {
  userName: string;
  referralCode: string;
  orders: OrderSummary[];
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", emoji: "☀️" };
  if (h < 17) return { text: "Good afternoon", emoji: "🌤️" };
  return { text: "Good evening", emoji: "👋" };
}

function formatDelivery(date: string | null) {
  if (!date) return "Schedule pending";
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "MMM d, yyyy");
}

function StatusChip({ status }: { status: string }) {
  const meta = getStatusMeta(status);
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.tone}`}>
      <Icon className="size-3" />
      {meta.label}
    </span>
  );
}

export function HomePageClient({ userName, referralCode, orders }: Props) {
  const [shareLink, setShareLink] = useState("");
  const { t, locale, setLocale } = useLanguage();
  const firstName = userName?.split(" ")[0] || "User";
  const greeting = getGreeting();

  const activeOrders = useMemo(
    () => orders.filter((o) => !["COMPLETED", "CANCELLED", "INSTALLED"].includes(o.status)),
    [orders]
  );
  const completedOrders = useMemo(
    () => orders.filter((o) => ["COMPLETED", "INSTALLED"].includes(o.status)),
    [orders]
  );
  const recentOrders = orders.slice(0, 3);

  useEffect(() => {
    if (referralCode && typeof window !== "undefined") {
      setShareLink(`${window.location.origin}/refer?code=${referralCode}`);
    }
  }, [referralCode]);

  const copyReferralCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied!");
  };

  const copyReferralLink = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    toast.success("Referral link copied!");
  };

  const shareWhatsApp = () => {
    if (!shareLink) return;
    const msg = `I am using Divy Power for solar. Book a free consultation: ${shareLink}. Referral code: ${referralCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f0]">
      {/* ─── Left Sidebar ─── */}
      <aside className="hidden xl:flex flex-col w-[220px] shrink-0 sticky top-0 h-screen bg-white border-r border-gray-100 py-6 px-3">
        {/* Logo */}
        <div className="px-3 mb-8">
          <Image src="/divy-power-logo.png" alt="Divy Power" width={110} height={38} className="h-9 w-auto" priority />
          <p className="text-[10px] text-gray-400 mt-1">Solar operations, made simple</p>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1 flex-1">
          {[
            { href: "/", label: "Home", icon: Home, active: true },
            { href: "/orders", label: "My Orders", icon: Package, active: false },
            { href: "/orders/new", label: "New Order", icon: Box, active: false, badge: "New" },
            { href: "/tickets", label: "My Complaints", icon: ClipboardList, active: false },
            { href: "/referrals", label: "Referral & Rewards", icon: Users, active: false },
            { href: "/tickets/new", label: "Support", icon: Headphones, active: false },
            { href: "/account", label: "Account", icon: User, active: false },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                item.active
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Support footer */}
        <div className="mt-auto px-3 pb-2">
          <div className="rounded-xl bg-orange-50 border border-orange-100 p-3">
            <p className="text-xs font-semibold text-orange-900">Need help?</p>
            <p className="text-[11px] text-orange-600 mt-0.5">Mon–Sat, 9:00 AM – 6:00 PM</p>
            <Link
              href="/tickets/new"
              className="mt-2 block w-full text-center text-xs font-bold bg-orange-500 text-white py-1.5 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Mobile logo */}
            <Image src="/divy-power-logo.png" alt="Divy Power" width={88} height={30} className="h-7 w-auto xl:hidden" />
            <div className="hidden xl:block">
              <p className="text-sm font-semibold text-gray-800">Customer Portal</p>
              <p className="text-xs text-gray-400">Solar operations, made simple</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={() => setLocale(locale === "hi" ? "en" : "hi")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Globe className="size-3.5" />
              {locale === "hi" ? "Hindi" : "English"}
            </button>
            {/* Bell */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="size-4 text-gray-500" />
              <span className="absolute top-1 right-1 size-2 bg-orange-500 rounded-full" />
            </button>
            {/* User avatar */}
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                U7
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-800">Hi, {firstName}</p>
                <p className="text-[11px] text-gray-400">7534034003</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <div className="flex gap-0">
          {/* ─── Center Feed ─── */}
          <main className="flex-1 min-w-0 px-4 sm:px-6 py-5 space-y-5">

            {/* Hero Banner */}
            <section className="rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 p-6 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <p className="text-orange-100 text-sm font-medium mb-2">
                    {greeting.text}, {firstName} {greeting.emoji}
                  </p>
                  <h1 className="text-white text-2xl sm:text-3xl font-bold leading-tight mb-3">
                    Your solar journey,<br />made simple.
                  </h1>
                  <p className="text-orange-100 text-sm leading-relaxed mb-5">
                    Track orders, get support, check rewards and manage everything in one place.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/orders"
                      className="inline-flex items-center gap-2 bg-white text-orange-600 font-semibold text-sm px-4 py-2.5 rounded-full hover:bg-orange-50 transition-colors"
                    >
                      <ClipboardList className="size-4" />
                      View My Orders
                    </Link>
                    <Link
                      href="/tickets/new"
                      className="inline-flex items-center gap-2 border border-white/40 text-white font-semibold text-sm px-4 py-2.5 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <Headphones className="size-4" />
                      Need Help?
                    </Link>
                  </div>
                </div>

                {/* Video thumbnail */}
                <div className="sm:w-[280px] shrink-0">
                  <div className="relative rounded-xl overflow-hidden bg-black/30 aspect-video flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-900/30 to-black/50" />
                    <button className="relative z-10 size-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                      <svg className="size-5 text-orange-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                    <div className="absolute bottom-2 left-3 right-3 z-10">
                      <p className="text-white text-xs font-semibold drop-shadow">Divy Power – Powering Every Home</p>
                      <p className="text-white/70 text-[10px]">1:35</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-800">Quick Actions</h2>
                <p className="text-xs text-gray-400">Shortcuts to important tasks</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    href: "/orders",
                    icon: Package,
                    color: "bg-orange-100 text-orange-600",
                    label: "Track Orders",
                    desc: "Check status of your projects and orders",
                  },
                  {
                    href: "/orders/new",
                    icon: Box,
                    color: "bg-teal-100 text-teal-600",
                    label: "New Order",
                    desc: "Request for new solar installation",
                  },
                  {
                    href: "/tickets/new",
                    icon: ClipboardList,
                    color: "bg-blue-100 text-blue-600",
                    label: "Raise Complaint",
                    desc: "Report an issue or get support",
                  },
                  {
                    href: "/referrals",
                    icon: Gift,
                    color: "bg-purple-100 text-purple-600",
                    label: "Refer & Earn",
                    desc: "Share link and earn rewards",
                  },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <div className={cn("size-10 rounded-full flex items-center justify-center mb-3", action.color)}>
                      <action.icon className="size-5" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{action.label}</p>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{action.desc}</p>
                    <ArrowRight className="size-4 text-gray-300 mt-2 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </section>

            {/* At a Glance */}
            <section>
              <h2 className="text-sm font-bold text-gray-800 mb-3">At a Glance</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Package, color: "text-orange-500 bg-orange-50", label: "Total Orders", value: orders.length, sub: "All time orders" },
                  { icon: Zap, color: "text-teal-500 bg-teal-50", label: "Active Projects", value: activeOrders.length, sub: "In progress" },
                  { icon: CheckCircle2, color: "text-blue-500 bg-blue-50", label: "Completed Installs", value: completedOrders.length, sub: "Successfully done" },
                  { icon: Gift, color: "text-purple-500 bg-purple-50", label: "Reward Tokens", value: 0, sub: "Total earned" },
                ].map((metric) => (
                  <div key={metric.label} className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className={cn("size-9 rounded-full flex items-center justify-center mb-3", metric.color)}>
                      <metric.icon className="size-4" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{metric.value}</p>
                    <p className="text-xs font-semibold text-gray-700 mt-1">{metric.label}</p>
                    <p className="text-[11px] text-gray-400">{metric.sub}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Orders */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-800">Recent Orders</h2>
                <Link href="/orders" className="text-xs font-semibold text-orange-500 hover:text-orange-700 inline-flex items-center gap-1">
                  View All Orders <ArrowRight className="size-3" />
                </Link>
              </div>
              {recentOrders.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center py-16 text-center">
                  <div className="size-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <Package className="size-7 text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-600">No orders yet</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs">Your solar project orders will appear here when created by the Divy Power team.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                  {recentOrders.map((order) => {
                    const firstItem = order.items[0];
                    return (
                      <Link
                        key={order.id}
                        href={`/orders/${order.id}`}
                        className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="size-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                          <Package className="size-5 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {firstItem?.name || "Solar project"}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">#{order.orderNumber} · {formatDelivery(order.deliveryDate)}</p>
                        </div>
                        <StatusChip status={order.status} />
                        <ArrowRight className="size-4 text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </main>

          {/* ─── Right Sidebar ─── */}
          <aside className="hidden lg:block w-[280px] xl:w-[300px] shrink-0 px-4 py-5 space-y-4">

            {/* PM Surya Ghar Subsidy */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="size-9 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                  <Sun className="size-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">PM Surya Ghar Subsidy</p>
                  <p className="text-xs text-gray-400 mt-0.5">Eligible customers can receive up to Rs 78,000.</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { val: "Rs 78k", label: "Max Subsidy" },
                  { val: "25 yr", label: "Panel Life" },
                  { val: "95%", label: "Bill Savings" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <p className="text-base font-bold text-orange-500">{item.val}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-800">Need a new consultation?</p>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">Share your details and our team will connect with you.</p>
                <Link
                  href="/refer"
                  className="mt-3 inline-flex items-center gap-1.5 bg-teal-600 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-teal-700 transition-colors"
                >
                  Request Consultation <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>

            {/* Referral Code */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Gift className="size-4 text-orange-500" />
                </div>
                <p className="text-sm font-bold text-gray-800">Your Referral Code</p>
              </div>
              <div className="flex items-center justify-between bg-orange-50 rounded-xl px-4 py-3 mb-4">
                <span className="font-mono text-lg font-bold tracking-widest text-orange-600">
                  {referralCode || "──────"}
                </span>
                <button
                  onClick={copyReferralCode}
                  disabled={!referralCode}
                  className="p-1.5 rounded-lg hover:bg-orange-100 text-orange-400 hover:text-orange-600 transition-colors"
                >
                  <Copy className="size-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={copyReferralLink}
                  disabled={!shareLink}
                  className="flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-semibold py-2.5 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <Copy className="size-3.5" />
                  Copy Link
                </button>
                <button
                  onClick={shareWhatsApp}
                  disabled={!shareLink}
                  className="flex items-center justify-center gap-1.5 bg-[#25D366] text-white text-xs font-semibold py-2.5 rounded-full hover:bg-[#1db954] transition-colors"
                >
                  <Share2 className="size-3.5" />
                  Share on WhatsApp
                </button>
              </div>
              <Link
                href="/referrals"
                className="inline-flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-700"
              >
                View Referral Dashboard <ArrowRight className="size-3" />
              </Link>
            </div>

            {/* Support Center */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Headphones className="size-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Support Center</p>
                  <p className="text-xs text-gray-400">We're here to help you anytime.</p>
                </div>
              </div>
              <div className="space-y-3">
                <a
                  href="tel:+911234567890"
                  className="flex items-center gap-3 text-sm text-gray-700 hover:text-orange-600 transition-colors"
                >
                  <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Phone className="size-3.5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold">Call Now</p>
                  </div>
                  <p className="text-xs text-gray-400">+91 12345 67890</p>
                </a>
                <a
                  href="https://wa.me/911234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-gray-700 hover:text-green-600 transition-colors"
                >
                  <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <MessageCircle className="size-3.5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold">Chat on WhatsApp</p>
                  </div>
                  <p className="text-xs text-gray-400">Quick support</p>
                </a>
                <Link
                  href="/tickets/new"
                  className="flex items-center gap-3 text-sm text-gray-700 hover:text-orange-600 transition-colors"
                >
                  <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <TicketIcon className="size-3.5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold">Create a Ticket</p>
                  </div>
                  <p className="text-xs text-gray-400">Get help via ticket</p>
                </Link>
              </div>
              <p className="text-[11px] text-gray-400 mt-3 border-t border-gray-50 pt-3">
                Support Hours: Mon – Sat, 9:00 AM – 6:00 PM
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}