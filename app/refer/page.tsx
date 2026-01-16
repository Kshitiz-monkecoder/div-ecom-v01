"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ReferPage() {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      referralCode: referralCode || null,
    };

    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to submit referral");
      }

      setSubmitted(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>Thank You!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground">
              We’ve received your referral request.
            </p>
            <p className="text-muted-foreground">
              Our team will contact you shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Referral Application</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your full name"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter phone number"
                required
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email"
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
                placeholder="Eg: Residential / Commercial"
                required
                value={formData.product}
                onChange={handleChange}
              />
            </div>

            {referralCode && (
              <div className="space-y-1">
                <Label htmlFor="referralCode">Referral Code</Label>
                <Input
                  id="referralCode"
                  value={referralCode}
                  readOnly
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Referral"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
