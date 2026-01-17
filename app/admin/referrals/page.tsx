"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export default function AdminApproveReferral() {
  const referrals = [
    {
      id: "REF001",
      name: "Amit Sharma",
      email: "amit@example.com",
      referredBy: "Khushi",
      status: "pending",
      createdAt: "2026-01-15",
    },
    {
      id: "REF002",
      name: "Neha Verma",
      email: "neha@example.com",
      referredBy: "Rohit",
      status: "pending",
      createdAt: "2026-01-14",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Approve Referrals</h1>

      <div className="grid gap-4">
        {referrals.map((ref) => (
          <Card key={ref.id} className="rounded-2xl shadow-sm">
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <p className="font-medium">{ref.name}</p>
                <p className="text-sm text-muted-foreground">{ref.email}</p>
                <p className="text-sm">
                  Referred by{" "}
                  <span className="font-medium">{ref.referredBy}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Submitted on {ref.createdAt}
                </p>
              </div>

              <div className="flex gap-2">
                <Button className="flex items-center gap-2">
                  <Check size={16} /> Approve
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
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
