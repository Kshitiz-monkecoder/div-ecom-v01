"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Coins,
  Copy,
  Gift,
  Link2,
  Send,
  TrendingUp,
  UserRound,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CustomerCard,
  CustomerPage,
  CustomerPageHeader,
  EmptyState,
  MetricCard,
  SectionHeader,
} from "@/components/customer-portal-ui";
import { StatusBadge } from "@/components/status-badge";
import { toast } from "sonner";

interface Referral {
  id: number;
  name: string;
  product: string;
  status: string;
  tokensAwarded: number;
  submittedAt?: string;
}

interface Token {
  id: string;
  amount: number;
  status: "UNUSED" | "USED";
  createdAt: string;
  usedAt?: string | null;
}

export default function ReferralsClient() {
  const [referralCode, setReferralCode] = useState("");
  const [loadingCode, setLoadingCode] = useState(true);
  const [shareLink, setShareLink] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(true);

  // WhatsApp send state
  const [waPhone, setWaPhone] = useState("");
  const [waName, setWaName] = useState("");
  const [waPhoneError, setWaPhoneError] = useState("");
  const [waSending, setWaSending] = useState(false);

  const totalEarned = referrals
    .filter((r) => r.status === "APPROVED")
    .reduce((sum, r) => sum + (r.tokensAwarded ?? 0), 0);

  const utilized = tokens
    .filter((t) => t.status === "USED")
    .reduce((sum, t) => sum + t.amount, 0);

  const remaining = Math.max(0, totalEarned - utilized);
  const successfulCount = referrals.filter((r) => r.status === "APPROVED").length;

  useEffect(() => {
    if (referralCode && typeof window !== "undefined") {
      setShareLink(`${window.location.origin}/refer?code=${referralCode}`);
    }
  }, [referralCode]);

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const res = await fetch("/api/user/referral-code");
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed");
        setReferralCode(data.code || "");
      } catch {
        /* non-fatal */
      } finally {
        setLoadingCode(false);
      }
    };

    const fetchReferrals = async () => {
      try {
        const res = await fetch("/api/user/referrals");
        const data = await res.json();
        setReferrals(Array.isArray(data) ? data : []);
      } catch {
        /* non-fatal */
      } finally {
        setLoadingReferrals(false);
      }
    };

    const fetchTokens = async () => {
      try {
        const res = await fetch("/api/user/tokens.ts");
        const data = await res.json();
        setTokens(Array.isArray(data) ? data : []);
      } catch {
        /* non-fatal */
      }
    };

    fetchCode();
    fetchReferrals();
    fetchTokens();
  }, []);

  const handleSendWhatsApp = async () => {
    const digits = waPhone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setWaPhoneError("Please enter a valid 10-digit number");
      return;
    }
    if (!waName.trim()) {
      setWaPhoneError("Please enter the person's name");
      return;
    }
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
    } catch {
      toast.error("Failed to send. Please try again.");
    } finally {
      setWaSending(false);
    }
  };

  return (
    <CustomerPage className="space-y-8">
      <CustomerPageHeader
        eyebrow="Referrals and tokens"
        title="Turn solar trust into rewards"
        description="Share your referral link, track people who submit interest, and monitor available reward tokens."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total earned"
          value={loadingCode ? "--" : totalEarned}
          icon={<TrendingUp className="size-5" />}
          detail="Approved referral reward tokens."
          tone="dark"
        />
        <MetricCard
          label="Available"
          value={remaining}
          icon={<CheckCircle2 className="size-5" />}
          detail="Tokens not yet utilized."
          tone="green"
        />
        <MetricCard
          label="Utilized"
          value={utilized}
          icon={<Coins className="size-5" />}
          detail="Tokens already consumed."
          tone="solar"
        />
        <MetricCard
          label="Successful"
          value={successfulCount}
          icon={<Gift className="size-5" />}
          detail="Approved referrals."
          tone="blue"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <CustomerCard className="overflow-hidden">
          <div className="bg-primary p-6 text-white">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-orange-200">
              <Gift className="size-6" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">Your referral power</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Share Divy Power with friends, family, and neighbours from one polished referral hub.
            </p>
          </div>

          <div className="space-y-5 p-5">
            {/* Referral code */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Referral code
              </p>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <span className="min-w-0 flex-1 truncate font-mono text-2xl font-semibold tracking-[0.18em] text-orange-900">
                  {loadingCode ? "--" : referralCode || "--"}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(referralCode);
                    toast.success("Copied");
                  }}
                  disabled={!referralCode || loadingCode}
                  className="rounded-full bg-white"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>

            {/* Referral link */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Referral link
              </p>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <Link2 className="size-4 shrink-0 text-slate-400" />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground">
                  {shareLink || "Generating link..."}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    toast.success("Copied");
                  }}
                  disabled={!shareLink}
                  className="rounded-full bg-white"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>

            {/* Send on WhatsApp — server-side */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Send on WhatsApp
              </p>
              <div className="mt-2 space-y-2">
                <Input
                  placeholder="Their name"
                  value={waName}
                  onChange={(e) => {
                    setWaName(e.target.value);
                    setWaPhoneError("");
                  }}
                  className="h-11 rounded-full border-slate-200 bg-white shadow-none"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={waPhone}
                      onChange={(e) => {
                        setWaPhone(e.target.value.replace(/\D/g, ""));
                        setWaPhoneError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendWhatsApp();
                      }}
                      className="h-11 rounded-full border-slate-200 bg-white shadow-none"
                      maxLength={10}
                    />
                    {waPhoneError && (
                      <p className="mt-1 text-xs text-rose-600">{waPhoneError}</p>
                    )}
                  </div>
                  <Button
                    className="h-11 rounded-full bg-[#168f4d] px-5 text-white hover:bg-[#117940]"
                    onClick={handleSendWhatsApp}
                    disabled={!referralCode || !waPhone || !waName || waSending}
                  >
                    <Send className="size-4" />
                    {waSending ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CustomerCard>

        <div className="space-y-6">
          <CustomerCard className="p-5">
            <SectionHeader
              title="How rewards work"
              description="Simple, trackable, and visible from your customer portal."
            />
            <div className="grid gap-3 md:grid-cols-3">
              {[
                ["1", "Share your code", "Send the link to someone interested in solar."],
                ["2", "They submit interest", "The Divy Power team follows up and surveys."],
                ["3", "Reward on install", "Approved installations add tokens to your account."],
              ].map(([step, title, desc]) => (
                <div key={step} className="rounded-2xl bg-slate-50 p-4">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-white text-sm font-semibold text-orange-900">
                    {step}
                  </span>
                  <p className="mt-3 text-sm font-semibold text-orange-900">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{desc}</p>
                </div>
              ))}
            </div>
          </CustomerCard>

          <CustomerCard className="p-5">
            <SectionHeader
              title="Referral history"
              description={`${successfulCount} successful referrals and ${totalEarned} earned tokens.`}
            />
            {loadingReferrals ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 skeleton rounded-2xl" />
                ))}
              </div>
            ) : referrals.length === 0 ? (
              <EmptyState
                title="No referrals yet"
                description="Share your referral link to start building reward history."
                icon={<UserRound className="size-5" />}
              />
            ) : (
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-500">
                        <UserRound className="size-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-orange-900">{referral.name}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{referral.product}</p>
                        {referral.submittedAt && (
                          <p className="mt-1 text-xs text-slate-400">
                            {new Date(referral.submittedAt).toLocaleDateString("en-IN")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={referral.status} />
                      {referral.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                          <Coins className="size-3.5" />
                          {referral.tokensAwarded ?? 0}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CustomerCard>

          {tokens.length > 0 && (
            <CustomerCard className="p-5">
              <SectionHeader title="Token usage history" />
              <div className="space-y-2">
                {tokens.map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Zap
                        className={`size-4 ${
                          token.status === "USED" ? "text-amber-500" : "text-emerald-600"
                        }`}
                      />
                      <span className="font-semibold text-orange-900">{token.amount} tokens</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          token.status === "USED"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-orange-800"
                        }`}
                      >
                        {token.status === "USED" ? "Utilized" : "Available"}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {token.status === "USED" && token.usedAt
                        ? new Date(token.usedAt).toLocaleDateString("en-IN")
                        : new Date(token.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </CustomerCard>
          )}
        </div>
      </section>
    </CustomerPage>
  );
}