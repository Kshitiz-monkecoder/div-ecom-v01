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

  // Referral code
  const [referralCode, setReferralCode] = useState("");
  const [loadingCode, setLoadingCode] = useState(true);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // Referrals
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(true);
  const [errorReferrals, setErrorReferrals] = useState<string | null>(null);

  // Tokens
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [errorTokens, setErrorTokens] = useState<string | null>(null);

  // Fetch referral code independently
  useEffect(() => {
    const fetchReferralCode = async () => {
      try {
        const res = await fetch("/api/user/referral-code");
        if (!res.ok) throw new Error("Failed to fetch referral code");
        const data = await res.json();
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

  // Fetch referrals independently
  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const res = await fetch("/api/user/referrals");
        if (!res.ok) throw new Error("Failed to fetch referrals");
        const data = await res.json();
        setReferrals(data);
      } catch (err: any) {
        console.error(err);
        setErrorReferrals(err.message || "Something went wrong");
      } finally {
        setLoadingReferrals(false);
      }
    };
    fetchReferrals();
  }, []);

  // Fetch tokens independently
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch("/api/user/tokens");
        if (!res.ok) throw new Error("Failed to fetch tokens");
        const data = await res.json();
        setTokens(data);
      } catch (err: any) {
        console.error(err);
        setErrorTokens(err.message || "Something went wrong");
      } finally {
        setLoadingTokens(false);
      }
    };
    fetchTokens();
  }, []);

  // Referral link
  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/refer?code=${referralCode}`
      : "";

  // Calculate total unused tokens
  const totalTokens = tokens
    .filter((t) => t.status === "Unused")
    .reduce((sum, t) => sum + t.amount, 0);

  // Copy referral code
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
              {loadingCode
                ? "Loading..."
                : errorCode
                ? `Error: ${errorCode}`
                : referralCode}
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
            Share link:{" "}
            <span className="font-medium">
              {loadingCode ? "Loading..." : referralLink}
            </span>
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
                {loadingReferrals ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-sm">
                      Loading...
                    </td>
                  </tr>
                ) : errorReferrals ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-sm text-red-500">
                      {errorReferrals}
                    </td>
                  </tr>
                ) : referrals.length === 0 ? (
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
                {loadingTokens ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-sm">
                      Loading...
                    </td>
                  </tr>
                ) : errorTokens ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-sm text-red-500">
                      {errorTokens}
                    </td>
                  </tr>
                ) : tokens.length === 0 ? (
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
