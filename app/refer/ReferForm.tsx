"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ReferForm() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("code");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    product: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
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
        // Extract error message from response
        const errorMessage = data?.error || "Failed to submit referral. Please try again.";
        setError(errorMessage);
        return;
      }

      setSubmitted(true);
    } catch (err: any) {
      // Handle network errors or other unexpected errors
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="text-lg font-semibold">Thank you!</div>
        <p className="mt-2 text-sm text-muted-foreground">
          We’ve received your request. Our team will contact you shortly.
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
      <div className="space-y-1">
        <Label htmlFor="name">Your Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Full name"
          required
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="phone">Your Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="10-digit phone number"
          required
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Your Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Email address"
          required
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="product">Product Required</Label>
        <Input
          id="product"
          name="product"
          placeholder="Eg: Residential rooftop / Commercial plant"
          required
          value={formData.product}
          onChange={handleChange}
        />
        <p className="text-xs text-muted-foreground">
          Mention category, capacity requirement (kW), and any site notes if available.
        </p>
      </div>

      {referralCode && (
        <div className="space-y-1">
          <Label htmlFor="referralCode">Referral Code</Label>
          <Input id="referralCode" value={referralCode} readOnly />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Submitting..." : "Submit Referral"}
      </Button>
    </form>
  );
}
