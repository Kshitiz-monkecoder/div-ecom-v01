"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { verifyOrderMaterialDetails } from "@/app/actions/orders";

interface OrderMaterialVerificationFormProps {
  orderId: string;
  bomCompleted: boolean;
}

export function OrderMaterialVerificationForm({
  orderId,
  bomCompleted,
}: OrderMaterialVerificationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      await verifyOrderMaterialDetails(orderId);
      toast.success("Material details verified successfully.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to verify material details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Confirm that the material details shown for this order are correct. This updates the BOM
        stage in your order pipeline.
      </p>
      <Button onClick={handleVerify} disabled={bomCompleted || loading}>
        {bomCompleted ? "Material Details Verified" : loading ? "Verifying..." : "Verify Material Details"}
      </Button>
    </div>
  );
}
