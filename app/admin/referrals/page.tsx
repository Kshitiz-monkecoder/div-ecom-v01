"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

type Referral = {
  id: number;
  status: string;
  submittedAt: string;
  tokensAwarded: number;

  // Referee
  name: string;
  email: string;

  // Referrer
  referrer?: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone: string;
  };
};

export default function AdminApproveReferral() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");

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
    const tokenAmount = tokenAmounts[id] || 100;
    const adminId = "admin123"; // replace with session/auth value

    try {
      await fetch(`/api/admin/referrals/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenAmount, adminId }),
      });

      setReferrals((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "Approved", tokensAwarded: tokenAmount } : r
        )
      );

      setShowInput((prev) => ({ ...prev, [id]: false }));
    } catch (err) {
      console.error("Failed to approve referral:", err);
    }
  };

  const rejectReferral = async (id: number) => {
    try {
      await fetch(`/api/admin/referrals/${id}/reject`, { method: "POST" });
      setReferrals((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "Rejected", tokensAwarded: 0 } : r
        )
      );
    } catch (err) {
      console.error("Failed to reject referral:", err);
    }
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
          No referrals found for &quot;{statusFilter}&quot; status 🎉
        </p>
      )}

      <div className="grid gap-4">
        {filteredReferrals.map((ref) => (
          <Card key={ref.id} className="rounded-2xl shadow-sm">
            <CardContent className="p-5 flex flex-col md:flex-row md:justify-between gap-4">
              {/* Left side: Referee & Referrer */}
              <div className="space-y-1 flex-1">
                <p className="font-medium">{ref.name}</p>
                <p className="text-sm text-muted-foreground">{ref.email}</p>

                <p className="text-xs text-muted-foreground">
                  Referred by:{" "}
                  <span className="font-semibold">
                    {ref.referrer?.name || ref.referrer?.phone}
                  </span>
                </p>

                {/* Tokens awarded (always visible) */}
                <p
                  className={`text-xs font-semibold ${
                    ref.status.toLowerCase() === "approved"
                      ? "text-green-600"
                      : ref.status.toLowerCase() === "rejected"
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  Tokens Awarded: {ref.tokensAwarded || 0}
                </p>

                {/* Status */}
                <p className="text-xs font-semibold">
                  Status: {ref.status.toUpperCase()}
                </p>
              </div>

              {/* Right side: Approve/Reject & Submitted */}
              <div className="flex flex-col md:items-end gap-2">
                {ref.status.toLowerCase() === "pending" ? (
                  !showInput[ref.id] ? (
                    <div className="flex gap-2">
                      <Button
                        className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
                        onClick={() => {
                          setShowInput((prev) => ({ ...prev, [ref.id]: true }));
                          setTokenAmounts((prev) => ({ ...prev, [ref.id]: 100 }));
                        }}
                      >
                        <Check size={16} /> Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 border-red-500 text-red-600 hover:bg-red-50"
                        onClick={() => rejectReferral(ref.id)}
                      >
                        <X size={16} /> Reject
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-2 items-start md:items-center bg-gray-50 p-3 rounded-lg border">
                      <h3 className="text-sm font-medium text-gray-700 mb-1 md:mb-0 md:mr-2">
                        Award Tokens:
                      </h3>
                      <input
                        type="number"
                        value={tokenAmounts[ref.id]}
                        onChange={(e) =>
                          setTokenAmounts((prev) => ({
                            ...prev,
                            [ref.id]: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-20 text-center border rounded px-2 py-1"
                      />
                      <Button
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => confirmApproval(ref.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setShowInput((prev) => ({ ...prev, [ref.id]: false }))
                        }
                      >
                        Cancel
                      </Button>
                    </div>
                  )
                ) : ref.status.toLowerCase() === "approved" ? (
                  <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
                    Approved
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded">
                    Rejected
                  </span>
                )}

                {/* Submitted date under approve/reject buttons */}
                <p className="text-xs text-muted-foreground mt-1">
                  Submitted on {new Date(ref.submittedAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
