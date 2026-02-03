"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { updateOrderMaterialDelivery } from "@/app/actions/orders";

interface OrderMaterialDeliveryToggleProps {
  orderId: string;
  isMaterialDelivery: boolean;
}

export function OrderMaterialDeliveryToggle({
  orderId,
  isMaterialDelivery,
}: OrderMaterialDeliveryToggleProps) {
  const router = useRouter();
  const [checked, setChecked] = useState(isMaterialDelivery);
  const [loading, setLoading] = useState(false);

  const handleChange = async (newValue: boolean) => {
    setLoading(true);
    try {
      await updateOrderMaterialDelivery(orderId, newValue);
      setChecked(newValue);
      toast.success(newValue ? "Marked as material delivery" : "Marked as installation/service delivery");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update");
      setChecked(checked);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="material-delivery"
        checked={checked}
        onCheckedChange={(value) => handleChange(value === true)}
        disabled={loading}
      />
      <Label
        htmlFor="material-delivery"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
      >
        Material delivery order
      </Label>
    </div>
  );
}
