"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Copy, CheckCircle } from "lucide-react";

interface Referral {
  id: number;
  name: string;
  product: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  tokensAwarded: number;
}

export default function ReferralsClient() {
  const [copied, setCopied] = useState(false);

  // Referral code
  const [referralCode, setReferralCode] = useState("");
  const [loadingCode, setLoadingCode] = useState(true);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState("");

  // Referrals
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(true);
  const [errorReferrals, setErrorReferrals] = useState<string | null>(null);

  // Tokens
  const [totalTokens, setTotalTokens] = useState(0);

  useEffect(() => {
    if (referralCode) {
      setShareLink(`${window.location.origin}/refer?code=${referralCode}`);
    }
  }, [referralCode]);

  useEffect(() => {
    const fetchReferralCode = async () => {
      try {
        const res = await fetch("/api/user/referral-code");
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to fetch referral code");
        setReferralCode(data.code);
      } catch (err: any) {
        console.error(err);
        setErrorCode(err.message || "Something went wrong");
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
        const data: Referral[] = await res.json();
        if (!res.ok) throw new Error("Failed to fetch referrals");

        setReferrals(data);

        const total = data
          .filter((ref) => ref.status === "APPROVED")
          .reduce((sum, ref) => sum + (ref.tokensAwarded ?? 0), 0);
        setTotalTokens(total);
      } catch (err: any) {
        console.error(err);
        setErrorReferrals(err.message || "Something went wrong");
      } finally {
        setLoadingReferrals(false);
      }
    };

    fetchReferrals();
  }, []);

  const handleCopyShare = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Referrals & Tokens</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Your Referral Code
          </CardTitle>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Tokens Awarded</p>
            <p className="text-xl font-semibold">{totalTokens} 🪙</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-3">
              <div className="inline-block px-4 py-2 rounded-md border text-lg font-mono bg-gray-50">
                {loadingCode
                  ? "Loading..."
                  : errorCode
                    ? `Error: ${errorCode}`
                    : referralCode}
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-md border text-lg bg-gray-50 flex-1">
                  {shareLink}
                </div>
                <Button size="sm" onClick={handleCopyShare} disabled={!shareLink}>
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referred Customers</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="py-2">Name</th>
                  <th className="py-2">Product</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Tokens Awarded</th>
                </tr>
              </thead>

              <tbody>
                {loadingReferrals ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm">
                      Loading...
                    </td>
                  </tr>
                ) : errorReferrals ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-red-500">
                      {errorReferrals}
                    </td>
                  </tr>
                ) : referrals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm">
                      No referrals yet.
                    </td>
                  </tr>
                ) : (
                  referrals.map((r) => (
                    <tr key={r.id} className="border-b text-sm">
                      <td className="py-3">{r.name}</td>
                      <td className="py-3">{r.product}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            r.status === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : r.status === "REJECTED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td className="py-3 text-right font-medium">
                        {r.status === "APPROVED" ? `${r.tokensAwarded ?? 0} 🪙` : "0"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

