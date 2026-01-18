"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

type Referral = {
  id: number;
  referralCode: string | null;
  name: string;
  email: string;
  status: string;
  submittedAt: string;
};

export default function AdminApproveReferral() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  // Track which referral has input open and token amount
  const [showInput, setShowInput] = useState<{ [id: number]: boolean }>({});
  const [tokenAmounts, setTokenAmounts] = useState<{ [id: number]: number }>({});

  useEffect(() => {
    fetch("/api/admin/referrals")
      .then((res) => res.json())
      .then((data) => {
        setReferrals(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const confirmApproval = async (id: number) => {
    const tokenAmount = tokenAmounts[id] || 100; // default 100 if admin didn’t edit
    const adminId = "admin123"; // replace with real adminId from session/auth

    try {
      await fetch(`/api/admin/referrals/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenAmount, adminId }),
      });

      // Remove from UI
      setReferrals((prev) => prev.filter((r) => r.id !== id));
      setShowInput((prev) => ({ ...prev, [id]: false }));
    } catch (err) {
      console.error("Failed to approve referral:", err);
    }
  };

  const rejectReferral = async (id: number) => {
    await fetch(`/api/admin/referrals/${id}/reject`, { method: "POST" });
    setReferrals((prev) => prev.filter((r) => r.id !== id));
  };

  const filteredReferrals = referrals.filter((r) =>
    statusFilter === "all" ? true : r.status.toLowerCase() === statusFilter
  );

  if (loading) return <p className="p-6">Loading referrals...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Approve Referrals</h1>

      {/* Status Filter Buttons */}
      <div className="flex gap-2">
        {["all", "pending", "approved", "rejected"].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            onClick={() => setStatusFilter(status as any)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {filteredReferrals.length === 0 && (
        <p className="text-muted-foreground mt-4">
          No referrals found for "{statusFilter}" status 🎉
        </p>
      )}

      <div className="grid gap-4">
        {filteredReferrals.map((ref) => (
          <Card key={ref.id} className="rounded-2xl shadow-sm">
            <CardContent className="p-5 flex flex-col md:flex-row md:justify-between gap-4">
              <div className="space-y-1">
                <p className="font-medium">{ref.name}</p>
                <p className="text-sm text-muted-foreground">{ref.email}</p>
                <p className="text-xs text-muted-foreground">
                  Code: {ref.referralCode ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Submitted on {new Date(ref.submittedAt).toLocaleDateString()}
                </p>
                <p className="text-xs font-semibold">
                  Status: {ref.status.toUpperCase()}
                </p>
              </div>

              {/* Approve / Reject with optional token input */}
              {ref.status.toLowerCase() === "pending" && (
                <div className="flex gap-2 items-center">
                  {!showInput[ref.id] ? (
                    <Button
                      className="flex items-center gap-2"
                      onClick={() => {
                        setShowInput((prev) => ({ ...prev, [ref.id]: true }));
                        setTokenAmounts((prev) => ({ ...prev, [ref.id]: 100 })); // default 100
                      }}
                    >
                      <Check size={16} /> Approve
                    </Button>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        placeholder="Tokens to award"
                        className="border rounded px-2 w-20"
                        value={tokenAmounts[ref.id]}
                        onChange={(e) =>
                          setTokenAmounts((prev) => ({
                            ...prev,
                            [ref.id]: parseInt(e.target.value),
                          }))
                        }
                      />
                      


                      <Button onClick={() => confirmApproval(ref.id)}>Confirm</Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setShowInput((prev) => ({ ...prev, [ref.id]: false }))
                        }
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => rejectReferral(ref.id)}
                  >
                    <X size={16} /> Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
