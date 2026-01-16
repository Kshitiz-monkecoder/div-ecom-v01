"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Copy, CheckCircle } from "lucide-react";

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);

  // Mock data (replace with API calls)
  const referralCode = "REF0021";
  const referralLink = `${typeof window !== "undefined" ? window.location.origin : ""}/refer?code=${referralCode}`;

  const referrals = [
    { name: "Rahul Sharma", product: "Residential", status: "Pending" },
    { name: "Anita Verma", product: "Commercial", status: "Successful" },
  ];

  const tokens = [
    { id: "TOK001", amount: 100, status: "Unused" },
    { id: "TOK002", amount: 200, status: "Used" },
  ];

  const totalTokens = tokens
    .filter((t) => t.status === "Unused")
    .reduce((sum, t) => sum + t.amount, 0);

  const handleCopy = async () =>  { 
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Referrals & Tokens</h1>

      {/* SECTION 1: Referral Code */}
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
              {referralCode}
            </div>
            <Button size="sm" onClick={handleCopy}>
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
            Share link: <span className="font-medium">{referralLink}</span>
          </p>
        </CardContent>
      </Card>

      {/* SECTION 2: Referred Customers */}
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
                  referrals.map((r, i) => (
                    <tr key={i} className="border-b text-sm">
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

      {/* SECTION 3: Tokens */}
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
