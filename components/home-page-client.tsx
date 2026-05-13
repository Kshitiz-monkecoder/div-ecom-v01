"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { format, isToday, isTomorrow } from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Copy,
  Gift,
  Headphones,
  Package,
  Phone,
  Share2,
  ShieldCheck,
  SunMedium,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CustomerCard, CustomerPage, EmptyState, MetricCard, SectionHeader } from "@/components/customer-portal-ui";
import { getStatusMeta } from "@/components/customer-status";

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
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
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
      <Icon className="size-3.5" />
      {meta.label}
    </span>
  );
}

function QuickAction({
  href,
  icon,
  label,
  description,
  primary,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  description: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-2xl border p-4 transition-all customer-focus-ring ${
        primary
          ? "border-slate-900 bg-primary text-primary-foreground shadow-[0_24px_60px_-38px_rgba(15,23,42,0.85)]"
          : "border-white/80 bg-white/75 text-orange-900 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_20px_50px_-34px_rgba(15,23,42,0.65)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`flex size-11 items-center justify-center rounded-2xl ${primary ? "bg-white/10 text-orange-200" : "bg-emerald-50 text-orange-600"}`}>
          {icon}
        </span>
        <ArrowRight className={`size-4 transition-transform group-hover:translate-x-1 ${primary ? "text-white/60" : "text-slate-400"}`} />
      </div>
      <p className="mt-4 text-sm font-semibold">{label}</p>
      <p className={`mt-1 text-xs leading-5 ${primary ? "text-white/60" : "text-slate-500"}`}>{description}</p>
    </Link>
  );
}

function OrderPreview({ order }: { order: OrderSummary }) {
  const firstItem = order.items[0];
  return (
    <Link
      href={`/orders/${order.id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_20px_60px_-38px_rgba(15,23,42,0.65)] customer-focus-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Order #{order.orderNumber}</p>
          <h3 className="mt-2 truncate text-base font-semibold text-orange-900">
            {firstItem?.name || "Solar project"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{firstItem?.capacity || "System details"}</p>
        </div>
        <StatusChip status={order.status} />
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
        <span className="inline-flex items-center gap-2 text-slate-500">
          <CalendarDays className="size-4" />
          {formatDelivery(order.deliveryDate)}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-orange-600">
          Details
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export function HomePageClient({ userName, referralCode, orders }: Props) {
  const [shareLink, setShareLink] = useState("");
  const firstName = userName?.split(" ")[0] || "there";

  const activeOrders = useMemo(
    () => orders.filter((order) => !["COMPLETED", "CANCELLED", "INSTALLED"].includes(order.status)),
    [orders]
  );
  const completedOrders = useMemo(
    () => orders.filter((order) => ["COMPLETED", "INSTALLED"].includes(order.status)),
    [orders]
  );
  const recentOrders = orders.slice(0, 3);
  const nextOrder = activeOrders[0] || orders[0];

  useEffect(() => {
    if (referralCode && typeof window !== "undefined") {
      setShareLink(`${window.location.origin}/refer?code=${referralCode}`);
    }
  }, [referralCode]);

  const copyReferralCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied");
  };

  const copyReferralLink = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    toast.success("Referral link copied");
  };

  const shareWhatsApp = () => {
    if (!shareLink) return;
    const msg = `I am using Divy Power for solar. You can book a free consultation here: ${shareLink}. Referral code: ${referralCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <CustomerPage className="space-y-8">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary p-6 text-white shadow-[0_30px_100px_-58px_rgba(15,23,42,0.9)] sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-amber-300 to-cyan-300" />
          <div className="relative z-10 max-w-3xl">
            <p className="text-sm font-medium text-orange-200">{getGreeting()}, {firstName}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              Your solar project, documents, support, and rewards in one clean workspace.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/68 sm:text-base">
              Track installation progress, verify materials, download documents, and get help without searching through scattered updates.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="h-11 rounded-full bg-white px-5 text-orange-900 hover:bg-emerald-50">
                <Link href={nextOrder ? `/orders/${nextOrder.id}` : "/orders"}>
                  <Package className="size-4" />
                  {nextOrder ? "Open active project" : "View orders"}
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-full border-white/20 bg-white/10 px-5 text-white hover:bg-white/15 hover:text-white">
                <Link href="/tickets/new">
                  <Headphones className="size-4" />
                  Get support
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-semibold">{orders.length}</p>
              <p className="mt-1 text-xs text-white/55">Total orders</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-semibold">{activeOrders.length}</p>
              <p className="mt-1 text-xs text-white/55">Active projects</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-semibold">{completedOrders.length}</p>
              <p className="mt-1 text-xs text-white/55">Completed installs</p>
            </div>
          </div>
        </div>

        <CustomerCard className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <SunMedium className="size-6" />
            </span>
            <div>
              <p className="text-sm font-semibold text-orange-900">PM Surya Ghar subsidy</p>
              <p className="text-sm text-slate-500">Eligible customers can receive up to Rs 78,000.</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div>
              <p className="text-xl font-semibold text-orange-900">Rs 78k</p>
              <p className="mt-1 text-xs text-slate-500">Max subsidy</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-orange-900">25 yr</p>
              <p className="mt-1 text-xs text-slate-500">Panel life</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-orange-900">95%</p>
              <p className="mt-1 text-xs text-slate-500">Bill savings</p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-orange-950">Need a new consultation?</p>
            <p className="mt-1 text-xs leading-5 text-orange-800/75">Share your referral link or book a consultation for someone interested in solar.</p>
            <Button asChild className="mt-4 h-10 rounded-full bg-emerald-700 px-4 text-white hover:bg-emerald-800">
              <Link href="/refer">Request quotation</Link>
            </Button>
          </div>
        </CustomerCard>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <QuickAction href="/orders" icon={<Package className="size-5" />} label="Track orders" description="Project status, delivery slot, documents, and materials." primary />
        <QuickAction href="/tickets/new" icon={<Headphones className="size-5" />} label="Raise support" description="Create a structured ticket with photos and order context." />
        <QuickAction href="/referrals" icon={<Gift className="size-5" />} label="Earn rewards" description="Share your code and track approved referral tokens." />
        <QuickAction href="/account" icon={<User className="size-5" />} label="Manage profile" description="Phone, email, documents, language, and account access." />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active projects" value={activeOrders.length} icon={<Zap className="size-5" />} detail="Orders still moving through approval, material, or install." tone="green" />
        <MetricCard label="Completed installs" value={completedOrders.length} icon={<CheckCircle2 className="size-5" />} detail="Installed or completed solar systems." tone="blue" />
        <MetricCard label="Referral code" value={referralCode || "--"} icon={<Gift className="size-5" />} detail="Use it to share Divy Power with others." tone="solar" />
        <MetricCard label="Support access" value="24h" icon={<Headphones className="size-5" />} detail="Typical response window for customer tickets." tone="neutral" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <SectionHeader
            title="Recent orders"
            description="A focused view of your latest solar projects and next steps."
            action={
              orders.length > 3 ? (
                <Button asChild variant="outline" className="rounded-full border-slate-200 bg-white/75">
                  <Link href="/orders">View all orders</Link>
                </Button>
              ) : null
            }
          />
          {orders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="Your assigned products and project orders will appear here when the Divy Power team creates them."
              action={
                <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-slate-800">
                  <Link href="/tickets/new">Contact support</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {recentOrders.map((order) => (
                <OrderPreview key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>

        <CustomerCard className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Gift className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-orange-900">Referral rewards</h2>
              <p className="text-sm text-slate-500">Share solar with people you trust.</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Your code</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate font-mono text-2xl font-semibold tracking-[0.18em] text-orange-900">
                {referralCode || "--"}
              </span>
              <Button type="button" size="icon" variant="outline" onClick={copyReferralCode} disabled={!referralCode} className="rounded-full bg-white">
                <Copy className="size-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <Button type="button" variant="outline" onClick={copyReferralLink} disabled={!shareLink} className="h-11 rounded-full bg-white">
              <Copy className="size-4" />
              Copy link
            </Button>
            <Button type="button" onClick={shareWhatsApp} disabled={!shareLink} className="h-11 rounded-full bg-[#168f4d] text-white hover:bg-[#117940]">
              <Share2 className="size-4" />
              WhatsApp
            </Button>
          </div>

          <Link href="/referrals" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-orange-600  hover:text-orange-800">
            View referral history
            <ArrowRight className="size-4" />
          </Link>
        </CustomerCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <CustomerCard className="p-5 lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-orange-600">
              <ShieldCheck className="size-6" />
            </span>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-orange-900">Trusted solar execution</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Divy Power combines subsidy guidance, material verification, delivery planning, and project updates in one customer portal.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full bg-white">
              <Link href="/orders">Open workspace</Link>
            </Button>
          </div>
        </CustomerCard>

        <CustomerCard className="p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Phone className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-orange-900">Need immediate help?</h2>
              <p className="mt-1 text-sm text-slate-500">Support is available Mon-Sat, 9 AM to 6 PM.</p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
                <a href="tel:+917065028801" className="text-orange-600  hover:text-orange-800">Call us</a>
                <Link href="/tickets/new" className="text-orange-600  hover:text-orange-800">Create ticket</Link>
              </div>
            </div>
          </div>
        </CustomerCard>
      </section>
    </CustomerPage>
  );
}
