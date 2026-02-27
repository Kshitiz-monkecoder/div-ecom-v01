"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Phone, MessageCircle, ShieldCheck } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to send OTP");
        return;
      }

      toast.success("OTP sent successfully to your WhatsApp");
      setStep("otp");
    } catch {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Invalid OTP");
        return;
      }

      toast.success("Login successful!");
      
      // Redirect admin users to admin panel, regular users to orders
      if (data.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/orders");
      }
      router.refresh();
    } catch {
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const maskedPhone = phone.length >= 6 ? `${phone.slice(0, 2)}******${phone.slice(-2)}` : phone;

  return (
    <Card className="w-full border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
      <CardHeader className="space-y-3 pb-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <ShieldCheck className="h-6 w-6" aria-hidden />
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight text-center">
          {step === "phone" ? "Sign in" : "Enter code"}
        </CardTitle>
        <p className="text-sm text-muted-foreground text-center leading-relaxed max-w-[320px] mx-auto">
          {step === "phone" ? (
            <>
              Sign in to your Divy Power account to view orders, track deliveries, and manage your profile. We&apos;ll send a one-time code to your WhatsApp.
            </>
          ) : (
            <>
              We sent a 6-digit code to <span className="font-medium text-foreground">{maskedPhone}</span>. Enter it below to continue.
            </>
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {step === "phone" ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" aria-hidden />
                Phone number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                maxLength={10}
                required
                disabled={loading}
                className="h-11 bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Enter your 10-digit Indian mobile number
              </p>
            </div>
            <Button
              type="submit"
              className="w-full h-11 font-medium"
              disabled={loading || phone.length !== 10}
            >
              {loading ? "Sending code…" : "Send code via WhatsApp"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-sm font-medium flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground" aria-hidden />
                Verification code
              </Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                required
                disabled={loading}
                autoFocus
                className="h-11 bg-background text-center text-lg tracking-[0.35em] font-mono tabular-nums"
              />
              <p className="text-xs text-muted-foreground">
                Code sent to WhatsApp · Expires in a few minutes
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                }}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 font-medium"
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying…" : "Verify"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

