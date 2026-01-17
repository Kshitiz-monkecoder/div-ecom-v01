"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Copy, CheckCircle } from "lucide-react";

interface Referral {
  id: number;
  name: string;
  product: string;
  status: "Pending" | "Successful" | "Rejected";
}

interface Token {
  id: string;
  amount: number;
  status: "Used" | "Unused";
}

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [referralCode, setReferralCode] = useState("");

  // Fetch referrals, tokens, and referral code from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch referrals
     const resReferrals = await fetch("/api/user/referrals");
  
    if (!resReferrals.ok) throw new Error("Failed to fetch referrals");
        const referralsData = await resReferrals.json();
        setReferrals(referralsData);

     // Fetch tokens for current user
     const resTokens = await fetch("/api/user/tokens");
        if (!resTokens.ok) throw new Error("Failed to fetch tokens");
        const tokensData = await resTokens.json();
        setTokens(tokensData);

        // Fetch current user referral code
        const resCode = await fetch("/api/user/referral-code");
        if (!resCode.ok) throw new Error("Failed to fetch referral code");
        const codeData = await resCode.json();
        setReferralCode(codeData.code);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/refer?code=${referralCode}`
      : "";

  const totalTokens = tokens
    .filter((t) => t.status === "Unused")
    .reduce((sum, t) => sum + t.amount, 0);

  const handleCopy = async () => {
    if (!referralCode) return;
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Referrals & Tokens</h1>

      {/* Referral Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-md border text-lg font-mono bg-gray-50">
              {referralCode || "Loading..."}
            </div>
            <Button size="sm" onClick={handleCopy} disabled={!referralCode}>
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
          <p className="text-sm text-muted-foreground break-all">
            Share link: <span className="font-medium">{referralLink || "Loading..."}</span>
          </p>
        </CardContent>
      </Card>

      {/* Referred Customers */}
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
                </tr>
              </thead>
              <tbody>
                {referrals.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-sm">
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
                            r.status === "Successful"
                              ? "bg-green-100 text-green-700"
                              : r.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Tokens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Available Tokens</span>
            <span className="text-xl font-semibold">{totalTokens}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="py-2">Token ID</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {tokens.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-sm">
                      No tokens earned yet.
                    </td>
                  </tr>
                ) : (
                  tokens.map((t) => (
                    <tr key={t.id} className="border-b text-sm">
                      <td className="py-3">{t.id}</td>
                      <td className="py-3">{t.amount}</td>
                      <td className="py-3">{t.status}</td>
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
