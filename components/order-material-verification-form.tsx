"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  requestOrderBomVerificationOtp,
  verifyOrderBomVerificationOtp,
} from "@/app/actions/orders";

interface OrderMaterialVerificationFormProps {
  orderId: string;
  bomCompleted: boolean;
  manuallyApproved: boolean;
}

export function OrderMaterialVerificationForm({
  orderId,
  bomCompleted,
  manuallyApproved,
}: OrderMaterialVerificationFormProps) {
  const router = useRouter();
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const handleRequestOtp = async () => {
    setRequestingOtp(true);
    try {
      await requestOrderBomVerificationOtp(orderId);
      setOtpSent(true);
      toast.success("OTP sent for BOM verification");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send verification OTP");
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setVerifyingOtp(true);
    try {
      await verifyOrderBomVerificationOtp(orderId, otp);
      toast.success("BOM verified successfully");
      setOtp("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to verify BOM");
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (bomCompleted) {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-orange-950">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-orange-600" />
        <div>
          <p className="text-sm font-semibold">Material details verified</p>
          <p className="mt-1 text-xs leading-5 text-orange-800/75">Your BOM verification is complete for this order.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-orange-600" />
        <div>
          <p className="text-sm font-semibold text-orange-900">Secure material verification</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Confirm that the BOM details for this order are correct. We will send an OTP on WhatsApp before marking the stage as completed.
          </p>
        </div>
      </div>

      <Button
        type="button"
        onClick={handleRequestOtp}
        disabled={!manuallyApproved || requestingOtp || verifyingOtp}
        className="h-11 rounded-full bg-primary px-5 text-white hover:bg-slate-800"
      >
        <KeyRound className="size-4" />
        {requestingOtp ? "Sending OTP..." : otpSent ? "Resend OTP" : "Send verification OTP"}
      </Button>

      {otpSent && (
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Input
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            className="h-12 rounded-2xl border-slate-200 bg-white text-center font-mono text-lg tracking-[0.3em] shadow-none"
          />
          <Button
            type="button"
            onClick={handleVerifyOtp}
            disabled={verifyingOtp || otp.length !== 6}
            className="h-12 rounded-2xl bg-emerald-700 px-5 text-white hover:bg-emerald-800"
          >
            {verifyingOtp ? "Verifying..." : "Verify BOM"}
          </Button>
        </div>
      )}

      {!manuallyApproved && (
        <p className="text-xs leading-5 text-slate-500">
          BOM verification becomes available after manual approval is completed by the Divy Power team.
        </p>
      )}
    </div>
  );
}
