"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { manuallyApproveOrder } from "@/app/actions/orders";

interface OrderManualApprovalFormProps {
  orderId: string;
  manuallyApproved: boolean;
}

export function OrderManualApprovalForm({
  orderId,
  manuallyApproved,
}: OrderManualApprovalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await manuallyApproveOrder(orderId);
      toast.success("Order manually approved.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to manually approve order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Complete the manual approval step before the customer can start BOM verification.
      </p>
      <Button onClick={handleApprove} disabled={manuallyApproved || loading}>
        {manuallyApproved ? "Manual Approval Completed" : loading ? "Approving..." : "Approve Order Manually"}
      </Button>
    </div>
  );
}
