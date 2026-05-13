"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, X, Search, Eye, Coins } from "lucide-react";
import { format } from "date-fns";

type Referral = {
  id: number;
  status: string;
  submittedAt: string;
  tokensAwarded: number;
  name: string;
  phone: string;
  email: string;
  product: string;
  referrer?: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone: string;
    referralCode?: string | null;
  };
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [search, setSearch] = useState("");
  const [tokenAmounts, setTokenAmounts] = useState<Record<number, number>>({});
  const [approving, setApproving] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [detailRef, setDetailRef] = useState<Referral | null>(null);
  const [showApproveInput, setShowApproveInput] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch("/api/admin/referrals")
      .then((r) => r.json())
      .then((d) => setReferrals(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return referrals.filter((r) => {
      const matchStatus = statusFilter === "all" || r.status.toLowerCase() === statusFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.referrer?.name?.toLowerCase().includes(q) ||
        r.referrer?.phone?.includes(q) ||
        String(r.id).includes(q);
      return matchStatus && matchSearch;
    });
  }, [referrals, statusFilter, search]);

  const handleApprove = async (id: number) => {
    const amount = tokenAmounts[id] ?? 100;
    setApproving(id);
    try {
      await fetch(`/api/admin/referrals/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenAmount: amount }),
      });
      setReferrals((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "approved", tokensAwarded: amount } : r
        )
      );
      setShowApproveInput((p) => ({ ...p, [id]: false }));
    } catch {
      alert("Failed to approve referral");
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (id: number) => {
    setRejecting(id);
    try {
      await fetch(`/api/admin/referrals/${id}/reject`, { method: "POST" });
      setReferrals((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "rejected", tokensAwarded: 0 } : r
        )
      );
    } catch {
      alert("Failed to reject referral");
    } finally {
      setRejecting(null);
    }
  };

  const counts = {
    all: referrals.length,
    pending: referrals.filter((r) => r.status.toLowerCase() === "pending").length,
    approved: referrals.filter((r) => r.status.toLowerCase() === "approved").length,
    rejected: referrals.filter((r) => r.status.toLowerCase() === "rejected").length,
  };

  if (loading) {
    return (
      <div className="p-8 text-muted-foreground animate-pulse">Loading referrals…</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Referrals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {counts.pending} pending · {counts.approved} approved · {counts.rejected} rejected
          </p>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? "default" : "outline"}
              onClick={() => setStatusFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="ml-1.5 text-xs opacity-70">({counts[s]})</span>
            </Button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-background overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Referee</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Referred By</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Tokens</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                  No referrals found
                </TableCell>
              </TableRow>
            )}
            {filtered.map((ref) => (
              <TableRow key={ref.id}>
                <TableCell className="text-muted-foreground text-xs font-mono">
                  {ref.id}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{ref.name}</p>
                    <p className="text-xs text-muted-foreground">{ref.email || "—"}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-mono">{ref.phone}</TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{ref.referrer?.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{ref.referrer?.phone || ""}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm max-w-[160px] truncate">{ref.product}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1 text-sm font-medium">
                    <Coins className="h-3.5 w-3.5 text-amber-500" />
                    {ref.tokensAwarded || 0}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      STATUS_STYLES[ref.status.toLowerCase()] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {ref.status.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {format(new Date(ref.submittedAt), "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => setDetailRef(ref)}
                      title="View details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>

                    {ref.status.toLowerCase() === "pending" && (
                      <>
                        {showApproveInput[ref.id] ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              className="w-16 border rounded px-1.5 py-0.5 text-xs"
                              value={tokenAmounts[ref.id] ?? 100}
                              onChange={(e) =>
                                setTokenAmounts((p) => ({
                                  ...p,
                                  [ref.id]: parseInt(e.target.value) || 0,
                                }))
                              }
                            />
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white px-2"
                              onClick={() => handleApprove(ref.id)}
                              disabled={approving === ref.id}
                            >
                              {approving === ref.id ? "…" : <Check className="h-3 w-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs px-1"
                              onClick={() =>
                                setShowApproveInput((p) => ({ ...p, [ref.id]: false }))
                              }
                            >
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white px-2"
                              onClick={() => {
                                setShowApproveInput((p) => ({ ...p, [ref.id]: true }));
                                setTokenAmounts((p) => ({ ...p, [ref.id]: 100 }));
                              }}
                            >
                              <Check className="h-3 w-3 mr-0.5" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50 px-2"
                              onClick={() => handleReject(ref.id)}
                              disabled={rejecting === ref.id}
                            >
                              {rejecting === ref.id ? "…" : <><X className="h-3 w-3 mr-0.5" /> Reject</>}
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!detailRef} onOpenChange={() => setDetailRef(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Referral #{detailRef?.id} — Details</DialogTitle>
          </DialogHeader>
          {detailRef && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Referee Name</p>
                  <p className="font-medium">{detailRef.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                  <p className="font-medium font-mono">{detailRef.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                  <p className="font-medium">{detailRef.email || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Product</p>
                  <p className="font-medium">{detailRef.product}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      STATUS_STYLES[detailRef.status.toLowerCase()] || ""
                    }`}
                  >
                    {detailRef.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Tokens Awarded</p>
                  <p className="font-medium flex items-center gap-1">
                    <Coins className="h-3.5 w-3.5 text-amber-500" />
                    {detailRef.tokensAwarded || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Submitted On</p>
                  <p className="font-medium">
                    {format(new Date(detailRef.submittedAt), "dd MMM yyyy, HH:mm")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Referral ID</p>
                  <p className="font-mono text-xs">{detailRef.id}</p>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">
                  Referrer Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Name</p>
                    <p className="font-medium">{detailRef.referrer?.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                    <p className="font-medium font-mono">{detailRef.referrer?.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                    <p className="font-medium">{detailRef.referrer?.email || "—"}</p>
                  </div>
                  {detailRef.referrer?.referralCode && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Referral Code</p>
                      <p className="font-mono text-sm">{detailRef.referrer.referralCode}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
