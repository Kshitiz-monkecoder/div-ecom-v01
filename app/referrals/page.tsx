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
/*
interface Token {
  id: string;
  amount: number;
  status: "Used" | "Unused";
}*/

export default function ReferralsPage() {
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
  /*const [tokens, setTokens] = useState<Token[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [errorTokens, setErrorTokens] = useState<string | null>(null); */

  useEffect(() => {
    if (referralCode) {
      setShareLink(`${window.location.origin}/refer?code=${referralCode}`);
    }
  }, [referralCode]);


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
  // Fetch referrals independently
  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const res = await fetch("/api/user/referrals");
        if (!res.ok) throw new Error("Failed to fetch referrals");

        const data: Referral[] = await res.json();
        setReferrals(data);

        // ✅ Calculate total approved tokens
        const total = data
          .filter(ref => ref.status === "APPROVED")
          .reduce((sum, ref) => sum + ref.tokensAwarded, 0);
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


  // Fetch tokens independently
  /*useEffect(() => {
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
  */



  // Calculate total unused tokens
  /*const totalTokens = tokens
    .filter((t) => t.status === "Unused")
    .reduce((sum, t) => sum + t.amount, 0);*/

  /*Copy referral code
  const handleCopy = async () => {
    if (!referralCode) return;
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };*/

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
  {/* Left side */}
  <CardTitle className="flex items-center gap-2">
    <Gift className="h-5 w-5" />
    Your Referral Code
  </CardTitle>

  {/* Right side */}
  <div className="text-right">
    <p className="text-sm text-muted-foreground">Total Tokens Awarded</p>
    <p className="text-xl font-semibold">{totalTokens} 🪙</p>
  </div>
</CardHeader>


       <CardContent className="space-y-3">
  <div className="flex flex-wrap items-start justify-between gap-6">

    {/* Left Side: Referral Code + Share Link */}
    <div className="flex items-start  gap-3">
      {/* Referral Code */}
 {/* Referral Code */}
<div className="inline-block px-4 py-2 rounded-md border text-lg font-mono bg-gray-50">
  {loadingCode
    ? "Loading..."
    : errorCode
      ? `Error: ${errorCode}`
      : referralCode}
</div>


      {/* Share Link with Copy Button */}
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
                    <td
                      colSpan={4}
                      className="py-6 text-center text-sm text-red-500"
                    >
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
                          className={`px-2 py-1 rounded text-xs font-medium ${r.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : r.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      {/* Tokens Awarded column */}

                      <td className="py-3 text-right font-medium">
                        {r.status === "APPROVED"
                          ? `${r.tokensAwarded ?? 0} 🪙`
                          : "0"}
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
      {/* <Card>
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
      </Card> */}
    </div>
  );
}
