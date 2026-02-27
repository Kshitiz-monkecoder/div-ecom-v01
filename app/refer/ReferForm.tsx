"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BILL_RANGES = [
  { value: "500-1000", label: "₹500-1000" },
  { value: "1000-2000", label: "₹1000-2000" },
  { value: "2000-5000", label: "₹2000-5000" },
  { value: "5000-8000", label: "₹5000-8000" },
  { value: "8000+", label: "₹8000+" },
];

const PROPERTY_TYPES = [
  { value: "मकान", label: "मकान" },
  { value: "फ्लैट", label: "फ्लैट" },
  { value: "दुकान", label: "दुकान" },
  { value: "फैक्ट्री", label: "फैक्ट्री" },
];

const AREAS = [
  "इंदिरापुरम", "वसुंधरा", "राजेंद्र नगर", "कविनगर", "वैशाली", "गाजियाबाद शहर",
  "अन्य (Ghaziabad)",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      <div className="text-center py-4">
        <p className="text-lg font-semibold">धन्यवाद!</p>
        <p className="mt-2 text-sm text-muted-foreground">
          हमें आपका रिक्वेस्ट मिल गया है। हमारी टीम जल्द ही संपर्क करेगी।
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">आपका नाम</Label>
        <Input
          id="name"
          name="name"
          placeholder="नाम"
          required
          value={formData.name}
          onChange={handleChange}
          className="min-h-[48px]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">मोबाइल नंबर</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="10-digit number"
          required
          value={formData.phone}
          onChange={handleChange}
          className="min-h-[48px]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">ईमेल (वैकल्पिक)</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="min-h-[48px]"
        />
      </div>
      <div className="space-y-2">
        <Label>मासिक बिजली बिल (लगभग)</Label>
        <Select value={formData.billRange} onValueChange={(v) => setFormData((p) => ({ ...p, billRange: v }))}>
          <SelectTrigger className="min-h-[48px]">
            <SelectValue placeholder="चुनें" />
          </SelectTrigger>
          <SelectContent>
            {BILL_RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>प्रॉपर्टी का प्रकार</Label>
        <Select value={formData.propertyType} onValueChange={(v) => setFormData((p) => ({ ...p, propertyType: v }))}>
          <SelectTrigger className="min-h-[48px]">
            <SelectValue placeholder="चुनें" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>एरिया</Label>
        <Select value={formData.area} onValueChange={(v) => setFormData((p) => ({ ...p, area: v }))}>
          <SelectTrigger className="min-h-[48px]">
            <SelectValue placeholder="चुनें" />
          </SelectTrigger>
          <SelectContent>
            {AREAS.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {referralCode && (
        <div className="space-y-2">
          <Label>रेफरल कोड</Label>
          <Input value={referralCode} readOnly className="min-h-[48px] bg-muted" />
        </div>
      )}
      <Button type="submit" className="w-full min-h-[48px] bg-[#27AE60] hover:bg-[#20a350]" disabled={loading}>
        {loading ? "लोड हो रहा है..." : "फ्री कंसल्टेशन बुक करें →"}
      </Button>
    </form>
  );
}
