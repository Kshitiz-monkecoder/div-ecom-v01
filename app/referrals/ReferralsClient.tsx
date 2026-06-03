"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  Copy,
  ExternalLink,
  Facebook,
  Gift,
  Globe,
  MoreHorizontal,
  Plus,
  Send,
  Share2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Referral {
  id: number;
  name: string;
  phone: string;
  product: string;
  status: string;
  tokensAwarded: number;
  submittedAt?: string;
}

interface TokenHistory {
  id: string;
  amount: number;
  description: string;
  createdAt: string;
}

const AVATAR_COLORS = [
  "bg-orange-100 text-orange-600",
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-purple-100 text-purple-600",
  "bg-pink-100 text-pink-600",
];

function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    APPROVED: "bg-emerald-100 text-emerald-700",
    PENDING:  "bg-amber-100 text-amber-700",
    REJECTED: "bg-rose-100 text-rose-700",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", map[status] ?? "bg-gray-100 text-gray-600")}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

const ACTIVE_TAB_KEY = "referral_history";

export default function ReferralsClient() {
  const refreshRef = useRef<(() => void) | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [loadingCode, setLoadingCode] = useState(true);
  const [shareLink, setShareLink] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [tokenHistory, setTokenHistory] = useState<TokenHistory[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(true);
  const [activeTab, setActiveTab] = useState<"history" | "tokens">("history");

  // WhatsApp send
  const [waPhone, setWaPhone] = useState("");
  const [waName, setWaName] = useState("");
  const [waPhoneError, setWaPhoneError] = useState("");
  const [waSending, setWaSending] = useState(false);

  const totalEarned     = referrals.filter((r) => r.status === "APPROVED").reduce((s, r) => s + (r.tokensAwarded ?? 0), 0);
  const utilized        = tokenHistory.reduce((s, t) => s + t.amount, 0);
  const successfulCount = referrals.filter((r) => r.status === "APPROVED").length;
  const tokensUtilized  = utilized;

  useEffect(() => {
    if (referralCode && typeof window !== "undefined") {
      setShareLink(`${window.location.origin}/refer?code=${referralCode}`);
    }
  }, [referralCode]);

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const res  = await fetch("/api/user/referral-code");
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed");
        setReferralCode(data.code || "");
      } catch { /* non-fatal */ } finally { setLoadingCode(false); }
    };

    const fetchReferrals = async () => {
      try {
        const res  = await fetch("/api/user/referrals");
        const data = await res.json();
        setReferrals(Array.isArray(data) ? data : []);
      } catch { /* non-fatal */ } finally { setLoadingReferrals(false); }
    };

    const fetchTokenHistory = async () => {
      try {
        const res  = await fetch("/api/user/token-history");
        const data = await res.json();
        setTokenHistory(Array.isArray(data) ? data : []);
      } catch { /* non-fatal */ }
    };

    refreshRef.current = fetchReferrals;
    fetchCode();
    fetchReferrals();
    fetchTokenHistory();
  }, []);

  const copyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied!");
  };

  const copyLink = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    toast.success("Referral link copied!");
  };

  const shareWhatsApp = () => {
    if (!shareLink) return;
    const msg = `I am using Divy Power for solar! You can book a free consultation here: ${shareLink}. Use my referral code: ${referralCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const shareFacebook = () => {
    if (!shareLink) return;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`, "_blank");
  };

  const handleSendWhatsApp = async () => {
    const digits = waPhone.replace(/\D/g, "");
    if (digits.length !== 10) { setWaPhoneError("Please enter a valid 10-digit number"); return; }
    if (!waName.trim()) { setWaPhoneError("Please enter the person's name"); return; }
    setWaPhoneError("");
    setWaSending(true);
    try {
      const res = await fetch("/api/user/send-referral-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits, referredToName: waName.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("WhatsApp message sent!");
      setWaPhone("");
      setWaName("");
      refreshRef.current?.();
    } catch { toast.error("Failed to send. Please try again."); } finally { setWaSending(false); }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f0]">
      {/* ─── Left Sidebar ─── */}
      <aside className="hidden xl:flex flex-col w-[220px] shrink-0 sticky top-0 h-screen bg-white border-r border-gray-100 py-6 px-3">
        <div className="px-3 mb-8">
          <img src="/divy-power-logo.png" alt="Divy Power" className="h-9 w-auto" />
          <p className="text-[10px] text-gray-400 mt-1">Solar operations, made simple</p>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {[
            { href: "/",           label: "Home",               active: false },
            { href: "/orders",     label: "My Orders",          active: false },
            { href: "/orders/new", label: "New Order",          active: false, badge: "New" },
            { href: "/tickets",    label: "Help & Support",     active: false },
            { href: "/referrals",  label: "Referral & Rewards", active: true },
            { href: "/account",    label: "Account",            active: false },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                item.active ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800")}>
              <span className="size-4 shrink-0 text-current opacity-60">
                {item.href === "/"           && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
                {item.href === "/orders"     && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>}
                {item.href === "/orders/new" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}
                {item.href === "/tickets"    && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>}
                {item.href === "/referrals"  && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                {item.href === "/account"    && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge && <span className="text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-3 pb-2">
          <div className="rounded-xl bg-orange-50 border border-orange-100 p-3">
            <p className="text-xs font-semibold text-orange-900">Need help?</p>
            <p className="text-[11px] text-orange-600 mt-0.5">Mon–Sat, 9:00 AM – 6:00 PM</p>
            <Link href="/tickets/new" className="mt-2 block w-full text-center text-xs font-bold bg-orange-500 text-white py-1.5 rounded-lg hover:bg-orange-600 transition-colors">
              Contact Support
            </Link>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img src="/divy-power-logo.png" alt="Divy Power" className="h-7 w-auto xl:hidden" />
            <div className="hidden xl:block">
              <p className="text-sm font-semibold text-gray-800">Customer Portal</p>
              <p className="text-xs text-gray-400">Solar operations, made simple</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
              <Globe className="size-3.5" /> English <ChevronDown className="size-3" />
            </button>
            <button className="relative p-2 rounded-full hover:bg-gray-100">
              <Bell className="size-4 text-gray-500" />
              <span className="absolute top-1 right-1 size-2 bg-orange-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">U7</div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-800">Hi, User</p>
                <p className="text-[11px] text-gray-400">7534034003</p>
              </div>
              <ChevronDown className="size-3.5 text-gray-400 hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Page Body */}
        <div className="flex-1 px-4 sm:px-6 py-6 space-y-5">

          {/* Title */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">Referral &amp; Rewards</h1>
            <p className="text-sm text-gray-500 mt-0.5">Invite friends, help them go solar and earn exciting rewards.</p>
          </div>

          {/* Hero Banner */}
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 overflow-hidden relative">
            <div className="flex-1">
              <p className="text-base font-semibold text-gray-700">Share DILVY Power and</p>
              <p className="text-3xl font-bold text-orange-500 mt-1">Earn Rewards</p>
              <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                Your friend gets clean energy.<br />You earn reward tokens.
              </p>
              <button
                onClick={shareWhatsApp}
                className="mt-5 inline-flex items-center gap-2 bg-orange-500 text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-orange-600 transition-colors shadow-sm"
              >
                <Share2 className="size-4" /> Share Now
              </button>
            </div>
            {/* Illustration */}
            <div className="shrink-0 hidden sm:flex items-end gap-8 pr-4">
              {/* Person 1 */}
              <div className="flex flex-col items-center gap-2">
                <div className="size-16 rounded-full bg-orange-200 flex items-center justify-center text-3xl">🧑</div>
                <p className="text-[11px] font-semibold text-gray-500">You Share</p>
              </div>
              {/* Arrow + gift */}
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="size-10 rounded-full bg-white border-2 border-orange-200 flex items-center justify-center text-xl shadow-sm">🎁</div>
                <div className="flex gap-1 mt-1">
                  {[0,1,2,3].map(i => <div key={i} className="size-1.5 rounded-full bg-orange-300" />)}
                </div>
              </div>
              {/* Person 2 */}
              <div className="flex flex-col items-center gap-2">
                <div className="size-16 rounded-full bg-green-200 flex items-center justify-center text-3xl">🧑</div>
                <p className="text-[11px] font-semibold text-gray-500">They Order</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: "👥", bg: "bg-green-50",  label: "Total Referrals",       value: referrals.length,   sub: "All time" },
              { icon: "✅", bg: "bg-blue-50",   label: "Successful Referrals",  value: successfulCount,    sub: "Approved & completed" },
              { icon: "🪙", bg: "bg-purple-50", label: "Reward Tokens Earned",  value: totalEarned,        sub: "All time" },
              { icon: "⚡", bg: "bg-orange-50", label: "Tokens Utilized",       value: tokensUtilized,     sub: "Used on new orders" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                <div className={cn("size-11 rounded-full flex items-center justify-center text-xl shrink-0", stat.bg)}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium leading-tight">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 leading-tight">{loadingCode && stat.label.includes("Tokens") ? "—" : stat.value}</p>
                  <p className="text-[11px] text-gray-400">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Referral Link + Share + How it works */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Referral Link Box */}
            <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <div>
                <p className="text-sm font-bold text-gray-800">Your Referral Link</p>
                <p className="text-xs text-gray-400 mt-0.5">Share your link with friends and family.</p>
              </div>
              {/* Link */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                <span className="flex-1 text-xs text-gray-600 truncate font-mono">
                  {shareLink || (loadingCode ? "Generating..." : "—")}
                </span>
                <button onClick={copyLink} disabled={!shareLink}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors disabled:opacity-40">
                  <Copy className="size-3.5" />
                </button>
              </div>
              <p className="text-xs text-gray-400">or use your referral code</p>
              {/* Code */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                <span className="flex-1 font-mono text-base font-bold tracking-widest text-gray-800">
                  {loadingCode ? "——" : referralCode || "——"}
                </span>
                <button onClick={copyCode} disabled={!referralCode}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors disabled:opacity-40">
                  <Copy className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Share via */}
            <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 p-5 space-y-3">
              <p className="text-sm font-bold text-gray-800">Share via</p>
              <button onClick={shareWhatsApp} disabled={!shareLink}
                className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] text-white text-sm font-bold py-3 rounded-xl hover:bg-[#1db954] transition-colors disabled:opacity-50">
                <span className="text-base">💬</span> WhatsApp
              </button>
              <button onClick={shareFacebook} disabled={!shareLink}
                className="w-full flex items-center justify-center gap-2.5 bg-[#1877F2] text-white text-sm font-bold py-3 rounded-xl hover:bg-[#166fe5] transition-colors disabled:opacity-50">
                <span className="text-base">📘</span> Facebook
              </button>
              <button onClick={() => { if (navigator.share && shareLink) { navigator.share({ title: "Join Divy Power", url: shareLink }); } else copyLink(); }}
                disabled={!shareLink}
                className="w-full flex items-center justify-center gap-2.5 bg-gray-100 text-gray-700 text-sm font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50">
                <MoreHorizontal className="size-4" /> More Options
              </button>
            </div>

            {/* How it works */}
            <div className="lg:col-span-1 bg-gray-50 border border-gray-100 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-full bg-green-100 flex items-center justify-center text-lg">🏆</div>
                <p className="text-sm font-bold text-gray-800">How it works?</p>
              </div>
              <div className="space-y-3">
                {[
                  "Share your referral link or code",
                  "Your friend places a solar order",
                  "Order gets approved & installed",
                  "You earn reward tokens",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="size-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-xs text-gray-600 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
              <button className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-700">
                View Terms &amp; Conditions <ArrowRight className="size-3" />
              </button>
            </div>
          </div>

          {/* Tabs: Referral History / Token Utilization */}
          <div>
            <div className="flex gap-1 border-b border-gray-200 mb-4">
              {[
                { key: "history", label: "Referral History" },
                { key: "tokens",  label: "Token Utilization" },
              ].map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key as "history" | "tokens")}
                  className={cn("px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px",
                    activeTab === tab.key ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700")}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Referral History Table */}
            {activeTab === "history" && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {loadingReferrals ? (
                  <div className="py-16 text-center text-sm text-gray-400">Loading referrals...</div>
                ) : referrals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="size-16 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl mb-4">👥</div>
                    <p className="text-sm font-semibold text-gray-600">No referrals yet</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">Share your referral link to start building your reward history.</p>
                    <button onClick={shareWhatsApp} disabled={!shareLink}
                      className="mt-5 inline-flex items-center gap-2 bg-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50">
                      <Share2 className="size-4" /> Share Now
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Table header */}
                    <div className="grid grid-cols-4 px-4 py-2.5 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <span>Name &amp; Mobile</span>
                      <span className="text-center">Order Date</span>
                      <span className="text-center">Status</span>
                      <span className="text-right">Tokens Earned</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {referrals.map((r) => {
                        const avatarColor = getAvatarColor(r.name || "A");
                        const dateStr = r.submittedAt
                          ? new Date(r.submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                          : "—";
                        return (
                          <div key={r.id} className="grid grid-cols-4 items-center px-4 py-3.5 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={cn("size-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0", avatarColor)}>
                                {(r.name || "?").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{r.name || "—"}</p>
                                {r.phone && <p className="text-xs text-gray-400">{r.phone}</p>}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 text-center">{dateStr}</p>
                            <div className="flex justify-center">
                              <StatusPill status={r.status} />
                            </div>
                            <div className="text-right">
                              {r.status === "APPROVED" ? (
                                <span className="inline-flex items-center gap-1 font-bold text-orange-500 text-sm">
                                  {r.tokensAwarded ?? 0} <span className="text-base">🪙</span>
                                </span>
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="px-4 py-3 border-t border-gray-100 flex justify-center">
                      <Link href="/referrals" className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-700">
                        View All Referrals <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Token Utilization Tab */}
            {activeTab === "tokens" && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {tokenHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="size-16 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl mb-4">⚡</div>
                    <p className="text-sm font-semibold text-gray-600">No tokens utilized yet</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">When tokens are applied to your orders, the history will appear here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {tokenHistory.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors">
                        <div className="size-10 rounded-full bg-amber-50 flex items-center justify-center text-xl shrink-0">⚡</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{entry.amount} tokens utilized</p>
                          <p className="text-xs text-gray-400 mt-0.5">{entry.description}</p>
                        </div>
                        <p className="text-xs text-gray-400 shrink-0">
                          {new Date(entry.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom CTA: Use tokens on new orders */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="size-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl shrink-0">🎁</div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-bold text-gray-800">Use your tokens on new orders</p>
              <p className="text-xs text-gray-500 mt-0.5">You can use your earned tokens while placing a new solar order.</p>
            </div>
            <Link href="/orders/new"
              className="shrink-0 inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
              <Plus className="size-4" /> New Order
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}