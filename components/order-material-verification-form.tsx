"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
      toast.success("OTP sent for BOM verification.");
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
      toast.success("BOM verified successfully.");
      setOtp("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to verify BOM");
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Confirm that the BOM details shown for this order are correct. We will send an OTP on
        WhatsApp before marking the stage as completed.
      </p>
      {!bomCompleted && (
        <Button onClick={handleRequestOtp} disabled={!manuallyApproved || requestingOtp || verifyingOtp}>
          {requestingOtp ? "Sending OTP..." : otpSent ? "Resend OTP" : "Send Verification OTP"}
        </Button>
      )}
      {otpSent && !bomCompleted && (
        <div className="space-y-3">
          <Input
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          <Button onClick={handleVerifyOtp} disabled={verifyingOtp || otp.length !== 6}>
            {verifyingOtp ? "Verifying..." : "Verify BOM"}
          </Button>
        </div>
      )}
      {bomCompleted && <Button disabled>Material Details Verified</Button>}
    </div>
  );
}
