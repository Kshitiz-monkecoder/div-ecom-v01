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
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");

  // Fetch referrals
  useEffect(() => {
    fetch("/api/admin/referrals")
      .then((res) => res.json())
      .then((data) => {
        setReferrals(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Approve / Reject handler
const updateStatus = async (id: number, action: "approved" | "rejected") => {
  const endpoint =
    action === "approved"
      ? `/api/admin/referrals/${id}/approve`
      : `/api/admin/referrals/${id}/reject`;

  await fetch(endpoint, { method: "POST" });

  // Remove from UI after action
  setReferrals((prev) => prev.filter((r) => r.id !== id));
};


  // Filter referrals by status
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
                  Submitted on{" "}
                  {new Date(ref.submittedAt).toLocaleDateString()}
                </p>
                <p className="text-xs font-semibold">
                  Status: {ref.status.toUpperCase()}
                </p>
              </div>

              {/* Approve / Reject Buttons only for pending */}
              {ref.status.toLowerCase() === "pending" && (
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
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
