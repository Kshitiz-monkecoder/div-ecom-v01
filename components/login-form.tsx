"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: FormEvent) => {
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

      toast.success("OTP sent to your WhatsApp");
      setStep("otp");
    } catch {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: FormEvent) => {
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

      toast.success("Login successful");
      
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
    <div className="rounded-[1.75rem] border border-white/80 bg-white/90 p-5 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.75)] backdrop-blur-xl sm:p-6">
      <div className="mb-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <ShieldCheck className="size-6" />
        </div>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-orange-900">
          {step === "phone" ? "Sign in securely" : "Enter verification code"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {step === "phone"
            ? "Use your registered mobile number. We will send a one-time code on WhatsApp."
            : `We sent a 6-digit code to ${maskedPhone}.`}
        </p>
      </div>

      {step === "phone" ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Phone className="size-4 text-slate-400" />
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
              className="h-12 rounded-2xl border-slate-200 bg-white text-base shadow-none"
            />
            <p className="text-xs text-slate-500">Enter your 10-digit Indian mobile number.</p>
          </div>
          <Button
            type="submit"
            className="h-12 w-full rounded-2xl bg-primary font-semibold text-white hover:bg-slate-800"
            disabled={loading || phone.length !== 10}
          >
            {loading ? "Sending code..." : "Send code via WhatsApp"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MessageCircle className="size-4 text-slate-400" />
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
              className="h-12 rounded-2xl border-slate-200 bg-white text-center font-mono text-xl tracking-[0.35em] shadow-none"
            />
            <p className="text-xs text-slate-500">Code sent to WhatsApp. It expires after a few minutes.</p>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-2xl bg-white"
              onClick={() => {
                setStep("phone");
                setOtp("");
              }}
              disabled={loading}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button
              type="submit"
              className="h-12 rounded-2xl bg-emerald-700 font-semibold text-white hover:bg-emerald-800"
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Verify and continue"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
