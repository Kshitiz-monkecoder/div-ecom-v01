"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BILL_RANGES = [
  { value: "500-1000", label: "Rs 500 - 1,000" },
  { value: "1000-2000", label: "Rs 1,000 - 2,000" },
  { value: "2000-5000", label: "Rs 2,000 - 5,000" },
  { value: "5000-8000", label: "Rs 5,000 - 8,000" },
  { value: "8000+", label: "Rs 8,000+" },
];

const PROPERTY_TYPES = [
  { value: "House", label: "House" },
  { value: "Apartment", label: "Apartment" },
  { value: "Shop", label: "Shop" },
  { value: "Factory", label: "Factory" },
];

const AREAS = [
  "Indirapuram",
  "Vasundhara",
  "Rajendra Nagar",
  "Kavi Nagar",
  "Vaishali",
  "Ghaziabad City",
  "Other Ghaziabad area",
];

export default function ReferForm({ referralCode }: { referralCode: string | null }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    product: "Residential rooftop",
    billRange: "",
    propertyType: "",
    area: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const productStr = [formData.product, formData.billRange, formData.propertyType, formData.area]
      .filter(Boolean)
      .join(" | ") || formData.product;

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      product: productStr,
      referralCode: referralCode || null,
    };

    try {
      const res = await fetch("/api/user/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to submit. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-orange-600">
          <CheckCircle2 className="size-7" />
        </div>
        <p className="mt-4 text-xl font-semibold text-orange-900">Request received</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The Divy Power team will contact you soon for a free solar consultation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Field label="Your name">
        <Input
          id="name"
          name="name"
          placeholder="Full name"
          required
          value={formData.name}
          onChange={handleChange}
          className="h-12 rounded-2xl border-slate-200 bg-white shadow-none"
        />
      </Field>
      <Field label="Mobile number">
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="10-digit number"
          required
          value={formData.phone}
          onChange={(event) => {
            setFormData((prev) => ({ ...prev, phone: event.target.value.replace(/\D/g, "").slice(0, 10) }));
            if (error) setError(null);
          }}
          className="h-12 rounded-2xl border-slate-200 bg-white shadow-none"
        />
      </Field>
      <Field label="Email (optional)">
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          className="h-12 rounded-2xl border-slate-200 bg-white shadow-none"
        />
      </Field>
      <Field label="Approximate monthly electricity bill">
        <Select value={formData.billRange} onValueChange={(v) => setFormData((p) => ({ ...p, billRange: v }))}>
          <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-white shadow-none">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {BILL_RANGES.map((range) => (
              <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Property type">
        <Select value={formData.propertyType} onValueChange={(v) => setFormData((p) => ({ ...p, propertyType: v }))}>
          <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-white shadow-none">
            <SelectValue placeholder="Select property" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Area">
        <Select value={formData.area} onValueChange={(v) => setFormData((p) => ({ ...p, area: v }))}>
          <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-white shadow-none">
            <SelectValue placeholder="Select area" />
          </SelectTrigger>
          <SelectContent>
            {AREAS.map((area) => (
              <SelectItem key={area} value={area}>{area}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      {referralCode && (
        <Field label="Referral code">
          <Input value={referralCode} readOnly className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-mono tracking-[0.16em] shadow-none" />
        </Field>
      )}
      <Button type="submit" className="h-12 w-full rounded-2xl bg-emerald-700 text-white hover:bg-emerald-800" disabled={loading}>
        {loading ? "Submitting..." : "Book free consultation"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-slate-700">{label}</Label>
      {children}
    </div>
  );
}
