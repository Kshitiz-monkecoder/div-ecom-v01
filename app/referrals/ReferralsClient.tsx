"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Copy, Share2, User } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { toast } from "sonner";

interface Referral {
  id: number;
  name: string;
  product: string;
  status: string;
  tokensAwarded: number;
}

const REFERRAL_STATUS_KEYS: Record<string, string> = {
  PENDING: "referrals.statusPending",
  APPROVED: "referrals.statusApproved",
  REJECTED: "referrals.statusRejected",
};

export default function ReferralsClient() {
  const { t } = useLanguage();
  const [referralCode, setReferralCode] = useState("");
  const [loadingCode, setLoadingCode] = useState(true);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(true);
  const [errorReferrals, setErrorReferrals] = useState<string | null>(null);

  const totalTokens = referrals
    .filter((r) => r.status === "APPROVED")
    .reduce((sum, r) => sum + (r.tokensAwarded ?? 0), 0);
  const successfulCount = referrals.filter((r) => r.status === "APPROVED").length;

  useEffect(() => {
    if (referralCode && typeof window !== "undefined") {
      setShareLink(`${window.location.origin}/refer?code=${referralCode}`);
    }
  }, [referralCode]);

  useEffect(() => {
    const fetchReferralCode = async () => {
      try {
        const res = await fetch("/api/user/referral-code");
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to fetch referral code");
        setReferralCode(data.code || "");
      } catch (err: unknown) {
        setErrorCode(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoadingCode(false);
      }
    };
    fetchReferralCode();
  }, []);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const res = await fetch("/api/user/referrals");
        const data = await res.json();
        if (!res.ok) throw new Error("Failed to fetch referrals");
        setReferrals(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        setErrorReferrals(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoadingReferrals(false);
      }
    };
    fetchReferrals();
  }, []);

  const handleCopyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    toast.success(t("toasts.copied"));
  };

  const handleCopyLink = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    toast.success(t("toasts.copied"));
  };

  const handleWhatsAppShare = () => {
    const message = `🙏 नमस्ते!

मैंने अपने घर में दिव्य पावर से सोलर पैनल लगवाया है। अब मेरा बिजली का बिल लगभग ₹0 आ रहा है! 😊

🏠 PM सूर्य घर योजना के तहत सरकार ₹78,000 तक की सब्सिडी देती है — सीधे आपके बैंक अकाउंट में।

✅ मैंने खुद लगवाया है, इसलिए भरोसे से कह रहा/रही हूँ — बिल्कुल सही कंपनी है।

👉 फ्री में जानकारी लें और कंसल्टेशन बुक करें:
${shareLink || ""}

मेरा रेफरल कोड इस्तेमाल करें: ${referralCode}
इससे आपको स्पेशल डिस्काउंट मिलेगा! 🎁`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    toast.success(t("toasts.referralShared"));
  };

  const getStatusLabel = (status: string) => {
    return t(REFERRAL_STATUS_KEYS[status] || "referrals.statusPending");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-4">
      {/* Hero: PM Surya Ghar branding */}
      <section className="rounded-2xl bg-linear-to-b from-[#FF9933]/20 via-white to-[#138808]/20 border border-border p-6 text-center">
        <p className="text-2xl mb-2">☀️</p>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          PM सूर्य घर मुफ्त बिजली योजना
        </h1>
        <p className="text-sm text-muted-foreground mt-2 italic">
          &ldquo;1 करोड़ घरों को मुफ्त बिजली&rdquo; — प्रधानमंत्री नरेंद्र मोदी जी
        </p>
        <p className="text-sm text-foreground mt-3">
          आप भी अपने पड़ोसियों और रिश्तेदारों को इस योजना का लाभ दिलाएं और इनाम कमाएं!
        </p>
      </section>

      {/* Your referral power */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            {t("referrals.yourReferralPower")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <code className="bg-muted px-4 py-3 rounded-lg font-mono text-lg border border-border">
              {loadingCode ? t("common.loading") : errorCode || referralCode || "—"}
            </code>
            <Button size="sm" onClick={handleCopyCode} disabled={!referralCode || loadingCode}>
              📋 {t("referrals.copyCode")}
            </Button>
          </div>
          <Button
            className="w-full min-h-[48px] bg-[#25D366] hover:bg-[#20BD5A] text-white"
            onClick={handleWhatsAppShare}
            disabled={!referralCode}
          >
            <Share2 className="h-5 w-5 mr-2" />
            {t("referrals.shareOnWhatsApp")}
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">{t("referrals.yourReferralLink")}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <code className="text-xs bg-muted px-2 py-1 rounded break-all flex-1 min-w-0">
                {shareLink || "…"}
              </code>
              <Button size="sm" variant="outline" onClick={handleCopyLink} disabled={!shareLink}>
                📋 {t("referrals.copyLink")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rewards explanation */}
      <Card>
        <CardHeader>
          <CardTitle>{t("referrals.howEarnWorks")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <span className="text-2xl">1️⃣</span>
            <div>
              <p className="font-semibold">{t("referrals.step1")}</p>
              <p className="text-sm text-muted-foreground">{t("referrals.step1Desc")}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-2xl">2️⃣</span>
            <div>
              <p className="font-semibold">{t("referrals.step2")}</p>
              <p className="text-sm text-muted-foreground">{t("referrals.step2Desc")}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-2xl">3️⃣</span>
            <div>
              <p className="font-semibold text-[#27AE60]">{t("referrals.step3")}</p>
              <p className="text-sm text-muted-foreground">{t("referrals.step3Desc")}</p>
            </div>
          </div>
          <p className="text-sm font-medium text-primary">{t("referrals.bonus")}</p>
        </CardContent>
      </Card>

      {/* Referral history */}
      <Card>
        <CardHeader>
          <CardTitle>{t("referrals.yourReferrals")}</CardTitle>
          <div className="flex flex-wrap gap-4 text-sm">
            <span>
              {t("referrals.totalTokens")} 🪙 {totalTokens}
            </span>
            <span>
              {t("referrals.successfulReferrals")} {successfulCount}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {loadingReferrals ? (
            <p className="text-muted-foreground py-4">{t("common.loading")}</p>
          ) : errorReferrals ? (
            <p className="text-destructive py-4">{errorReferrals}</p>
          ) : referrals.length === 0 ? (
            <p className="text-muted-foreground py-4">{t("referrals.shareMore")}</p>
          ) : (
            <ul className="space-y-4">
              {referrals.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{r.name}</span>
                    <span className="text-sm text-muted-foreground">— {r.product}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        r.status === "APPROVED"
                          ? "bg-[#27AE60]/20 text-[#27AE60]"
                          : r.status === "REJECTED"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {getStatusLabel(r.status)}
                    </span>
                    {r.status === "APPROVED" && (
                      <span className="text-sm font-medium">
                        {t("referrals.tokensEarned")} 🪙 {r.tokensAwarded ?? 0}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Button
            className="mt-4 w-full min-h-[48px] bg-[#25D366] hover:bg-[#20BD5A] text-white"
            onClick={handleWhatsAppShare}
            disabled={!referralCode}
          >
            📤 {t("referrals.shareOnWhatsApp")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
