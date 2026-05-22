"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Check, X, Search, Eye, Coins, ChevronRight, Loader2, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

type ReferralCustomer = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  role?: string | null;
  referralCode?: string | null;
};

const INITIAL_ADD_REFERRAL_FORM = {
  name: "",
  phone: "",
  email: "",
  product: "Residential rooftop",
  billRange: "",
  propertyType: "",
  area: "",
  referrerId: "",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const BILL_RANGES = [
  { value: "500-1000", label: "Rs 500 - 1,000" },
  { value: "1000-2000", label: "Rs 1,000 - 2,000" },
  { value: "2000-5000", label: "Rs 2,000 - 5,000" },
  { value: "5000-8000", label: "Rs 5,000 - 8,000" },
  { value: "8000+", label: "Rs 8,000+" },
];

const PROPERTY_TYPES = ["House", "Apartment", "Shop", "Factory"];

const AREAS = [
  "Indirapuram",
  "Vasundhara",
  "Rajendra Nagar",
  "Kavi Nagar",
  "Vaishali",
  "Ghaziabad City",
  "Other Ghaziabad area",
];

// ─── Referral Tab ────────────────────────────────────────────────────────────

function ReferralTab() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [search, setSearch] = useState("");
  const [tokenAmounts, setTokenAmounts] = useState<Record<number, number>>({});
  const [approving, setApproving] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [detailRef, setDetailRef] = useState<Referral | null>(null);
  const [showApproveInput, setShowApproveInput] = useState<Record<number, boolean>>({});

  // ── Add Referral state ──
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState(INITIAL_ADD_REFERRAL_FORM);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState("");
  const [customers, setCustomers] = useState<ReferralCustomer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersLoaded, setCustomersLoaded] = useState(false);
  const [customerLoadError, setCustomerLoadError] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/referrals")
      .then((r) => r.json())
      .then((d) => setReferrals(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadCustomers = () => {
    if (customersLoaded || customersLoading) return;
    setCustomersLoading(true);
    setCustomerLoadError("");

    fetch("/api/admin/users-for-assignment")
      .then((r) => r.json())
      .then((data) => {
        const rows = Array.isArray(data) ? data : data?.users;
        const customerRows = Array.isArray(rows) ? rows : [];

        setCustomers(
          customerRows
            .filter((customer) => customer?.id && customer?.phone)
            .filter((customer) => !customer.role || String(customer.role).toUpperCase() !== "ADMIN")
        );
        setCustomersLoaded(true);
      })
      .catch(() => {
        setCustomers([]);
        setCustomerLoadError("Failed to load customers.");
      })
      .finally(() => setCustomersLoading(false));
  };

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

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(q) ||
        customer.phone.includes(q) ||
        customer.email?.toLowerCase().includes(q) ||
        customer.referralCode?.toLowerCase().includes(q)
    );
  }, [customers, customerSearch]);

  const selectedReferrer = useMemo(() => {
    return customers.find((customer) => customer.id === addForm.referrerId) || null;
  }, [customers, addForm.referrerId]);

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

  const handleAddReferral = async () => {
    setAddError("");

    const productStr =
      [addForm.product, addForm.billRange, addForm.propertyType, addForm.area]
        .filter(Boolean)
        .join(" | ") || addForm.product;

    if (!addForm.name.trim() || !addForm.phone.trim() || !productStr) {
      setAddError("Name, phone and product are required.");
      return;
    }
    if (!addForm.referrerId) {
      setAddError("Choose the customer who made the referral.");
      return;
    }

    setAddSubmitting(true);
    try {
      const res = await fetch("/api/admin/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name.trim(),
          phone: addForm.phone.trim(),
          email: addForm.email.trim() || undefined,
          product: productStr,
          referrerId: addForm.referrerId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data?.error || "Failed to create referral.");
        return;
      }
      // Prepend the new referral to the list
      setReferrals((prev) => [data, ...prev]);
      setShowAddDialog(false);
      setAddForm(INITIAL_ADD_REFERRAL_FORM);
      setCustomerSearch("");
    } catch {
      setAddError("Unexpected error. Please try again.");
    } finally {
      setAddSubmitting(false);
    }
  };

  const counts = {
    all: referrals.length,
    pending: referrals.filter((r) => r.status.toLowerCase() === "pending").length,
    approved: referrals.filter((r) => r.status.toLowerCase() === "approved").length,
    rejected: referrals.filter((r) => r.status.toLowerCase() === "rejected").length,
  };

  if (loading) {
    return <div className="p-8 text-muted-foreground animate-pulse">Loading referrals…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <p className="text-sm text-muted-foreground">
        {counts.pending} pending · {counts.approved} approved · {counts.rejected} rejected
      </p>

      {/* Filters + Search + Add button */}
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
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shrink-0"
          onClick={() => {
            setAddError("");
            setCustomerSearch("");
            loadCustomers();
            setShowAddDialog(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Referral
        </Button>
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
                <TableCell className="text-muted-foreground text-xs font-mono">{ref.id}</TableCell>
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

      {/* ── Add Referral Dialog ── */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) setAddError("");
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Referral Manually</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 text-sm">
            {addError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {addError}
              </p>
            )}

            {/* ── Referee section ── */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Referee (New Lead)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Name *</Label>
                  <Input
                    placeholder="Full name"
                    value={addForm.name}
                    onChange={(e) => {
                      setAddForm((p) => ({ ...p, name: e.target.value }));
                      setAddError("");
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone *</Label>
                  <Input
                    placeholder="10-digit mobile"
                    value={addForm.phone}
                    onChange={(e) => {
                      setAddForm((p) => ({
                        ...p,
                        phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                      }));
                      setAddError("");
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email (optional)</Label>
                  <Input
                    placeholder="you@example.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Product *</Label>
                  <Input
                    value={addForm.product}
                    onChange={(e) => setAddForm((p) => ({ ...p, product: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Bill Range (optional)</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={addForm.billRange}
                    onChange={(e) => setAddForm((p) => ({ ...p, billRange: e.target.value }))}
                  >
                    <option value="">Select range</option>
                    {BILL_RANGES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Property Type (optional)</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={addForm.propertyType}
                    onChange={(e) => setAddForm((p) => ({ ...p, propertyType: e.target.value }))}
                  >
                    <option value="">Select type</option>
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Area (optional)</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={addForm.area}
                    onChange={(e) => setAddForm((p) => ({ ...p, area: e.target.value }))}
                  >
                    <option value="">Select area</option>
                    {AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Referrer section ── */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Referrer Customer *
                </p>
                {customersLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customer by name, phone, email"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto rounded-md border bg-background">
                  {customerLoadError ? (
                    <p className="px-3 py-4 text-sm text-red-600">{customerLoadError}</p>
                  ) : customersLoading ? (
                    <div className="flex items-center justify-center py-6 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : filteredCustomers.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground">No customers found</p>
                  ) : (
                    filteredCustomers.map((customer) => {
                      const selected = addForm.referrerId === customer.id;

                      return (
                        <button
                          key={customer.id}
                          type="button"
                          className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-muted/60 ${
                            selected ? "bg-blue-50 text-blue-900" : ""
                          }`}
                          onClick={() => {
                            setAddForm((p) => ({ ...p, referrerId: customer.id }));
                            setAddError("");
                          }}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{customer.name}</span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {customer.phone}
                              {customer.email ? ` - ${customer.email}` : ""}
                            </span>
                          </span>
                          {selected && <Check className="h-4 w-4 shrink-0 text-blue-600" />}
                        </button>
                      );
                    })
                  )}
                </div>
                {selectedReferrer && (
                  <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                    <span className="font-medium">{selectedReferrer.name}</span>
                    <span className="text-blue-700"> - {selectedReferrer.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex gap-2 justify-end pt-1">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                disabled={addSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddReferral}
                disabled={addSubmitting || customersLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {addSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create Referral
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Token Tab ────────────────────────────────────────────────────────────────

type TokenUser = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  totalTokens: number;
  usedTokens: number;
  availableTokens: number;
};

type HistoryEntry = {
  id: string;
  amount: number;
  description: string;
  createdAt: string;
  user: { id: string; name: string; phone: string; email: string | null };
  admin: { id: string; name: string };
};

function TokenTab() {
  const [users, setUsers] = useState<TokenUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<TokenUser | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchHistory = () => {
    setHistoryLoading(true);
    fetch("/api/admin/tokens/history")
      .then((r) => r.json())
      .then((d) => setHistory(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  };

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/admin/tokens/users")
      .then((r) => r.json())
      .then((d) => setUsers(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch("/api/admin/tokens/users")
      .then((r) => r.json())
      .then((d) => setUsers(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/admin/tokens/history")
      .then((r) => r.json())
      .then((d) => setHistory(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleUtilize = async () => {
    if (!selectedUser) return;
    const tokenAmount = parseInt(amount, 10);
    if (!tokenAmount || tokenAmount <= 0) {
      setErrorMsg("Enter a valid token amount.");
      return;
    }
    if (tokenAmount > selectedUser.availableTokens) {
      setErrorMsg(`Customer only has ${selectedUser.availableTokens} available tokens.`);
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Please enter a description/reason.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/tokens/utilize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: tokenAmount,
          description: description.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");

      setSuccessMsg(`${tokenAmount} tokens successfully utilized for ${selectedUser.name}.`);
      setAmount("");
      setDescription("");
      setSelectedUser(null);
      fetchUsers();
      fetchHistory();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to utilize tokens.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success banner */}
      {successMsg && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-green-600 hover:text-green-800 ml-4">✕</button>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9"
        />
      </div>

      {/* User list */}
      <div className="rounded-lg border bg-background overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Total Earned</TableHead>
              <TableHead>Utilized</TableHead>
              <TableHead>Available</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No customers with tokens found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => (
                <TableRow
                  key={u.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setSelectedUser(u);
                    setAmount("");
                    setDescription("");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email || "—"}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-mono">{u.phone}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <Coins className="h-3.5 w-3.5 text-amber-500" />
                      {u.totalTokens}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.usedTokens}</TableCell>
                  <TableCell>
                    <span className={`text-sm font-semibold ${u.availableTokens > 0 ? "text-green-700" : "text-muted-foreground"}`}>
                      {u.availableTokens}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Token Utilization History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Utilization History</h2>
          {historyLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="rounded-lg border bg-background overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Tokens Utilized</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>By (Admin)</TableHead>
                <TableHead>Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!historyLoading && history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No token utilizations yet
                  </TableCell>
                </TableRow>
              )}
              {history.map((h) => (
                <TableRow key={h.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{h.user.name}</p>
                      <p className="text-xs text-muted-foreground">{h.user.email || "—"}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-mono">{h.user.phone}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm font-semibold text-amber-700">
                      <Coins className="h-3.5 w-3.5 text-amber-500" />
                      {h.amount}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm max-w-[240px]">
                    <p className="truncate" title={h.description}>{h.description}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{h.admin.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(h.createdAt), "dd MMM yyyy, HH:mm")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Token Utilization Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => { if (!open) setSelectedUser(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Utilize Tokens — {selectedUser?.name}</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-5">
              {/* Balance summary */}
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                <Coins className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="text-sm font-medium text-amber-800">
                  {selectedUser.availableTokens} tokens available
                </span>
                <span className="text-xs text-amber-600 ml-auto">
                  ({selectedUser.usedTokens} already utilized)
                </span>
              </div>

              {/* Error */}
              {errorMsg && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {errorMsg}
                </p>
              )}

              {/* Token amount */}
              <div className="space-y-1.5">
                <Label htmlFor="token-amount">Tokens to Utilize</Label>
                <Input
                  id="token-amount"
                  type="number"
                  min={1}
                  max={selectedUser.availableTokens}
                  placeholder={`Max ${selectedUser.availableTokens}`}
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setErrorMsg(""); }}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="token-desc">Description / Reason</Label>
                <Textarea
                  id="token-desc"
                  placeholder="e.g. Applied as discount on Order #1234"
                  rows={3}
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setErrorMsg(""); }}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-1">
                <Button
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUtilize}
                  disabled={submitting || !amount || !description.trim()}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Processing…</>
                  ) : (
                    <><Coins className="h-4 w-4 mr-1.5" /> Utilize Tokens</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────

export default function AdminReferralsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Referrals & Tokens</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage customer referrals and token utilization.
        </p>
      </div>

      <Tabs defaultValue="referral">
        <TabsList className="mb-4">
          <TabsTrigger value="referral">Referral</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
        </TabsList>

        <TabsContent value="referral">
          <ReferralTab />
        </TabsContent>

        <TabsContent value="tokens">
          <TokenTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
