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

  //  Fetch referrals
  useEffect(() => {
    fetch("/api/admin/referrals")
      .then((res) => res.json())
      .then((data) => {
        setReferrals(data);
        setLoading(false);
      });
  }, []);

  // Approve / Reject handler
  const updateStatus = async (id: number, action: "approved" | "rejected") => {
    await fetch(`/api/admin/referrals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    // Remove from UI after action
    setReferrals((prev) => prev.filter((r) => r.id !== id));
  };

  if (loading) return <p className="p-6">Loading referrals...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Approve Referrals</h1>

      {referrals.length === 0 && (
        <p className="text-muted-foreground">No pending referrals 🎉</p>
      )}

      <div className="grid gap-4">
        {referrals.map((ref) => (
          <Card key={ref.id} className="rounded-2xl shadow-sm">
            <CardContent className="p-5 flex flex-col md:flex-row md:justify-between gap-4">
              <div className="space-y-1">
                <p className="font-medium">{ref.name}</p>
                <p className="text-sm text-muted-foreground">{ref.email}</p>
                <p className="text-xs text-muted-foreground">
                  Code: {ref.referralCode ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Submitted on{" "}
                  {new Date(ref.submittedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex items-center gap-2"
                  onClick={() => updateStatus(ref.id, "approved")}
                >
                  <Check size={16} /> Approve
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => updateStatus(ref.id, "rejected")}
                >
                  <X size={16} /> Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
