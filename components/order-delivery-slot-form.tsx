"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderDeliverySlot } from "@/app/actions/orders";
import { DELIVERY_SLOTS } from "@/types";
import { format } from "date-fns";

interface OrderDeliverySlotFormProps {
  orderId: string;
  currentDeliveryDate: Date | null;
  currentDeliverySlot: string | null;
}

export function OrderDeliverySlotForm({
  orderId,
  currentDeliveryDate,
  currentDeliverySlot,
}: OrderDeliverySlotFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [deliveryDate, setDeliveryDate] = useState(
    currentDeliveryDate ? format(new Date(currentDeliveryDate), "yyyy-MM-dd") : today
  );
  const [deliverySlot, setDeliverySlot] = useState<string>(
    currentDeliverySlot ?? DELIVERY_SLOTS[0].value
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateOrderDeliverySlot(orderId, new Date(deliveryDate), deliverySlot);
      toast.success("Delivery slot updated successfully!");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update delivery slot");
    } finally {
      setLoading(false);
    }
  };

  const slotLabel = DELIVERY_SLOTS.find((s) => s.value === currentDeliverySlot)?.label;

  return (
    <div className="space-y-4">
      {currentDeliveryDate && currentDeliverySlot && (
        <p className="text-sm text-muted-foreground">
          Current slot: {format(new Date(currentDeliveryDate), "MMM dd, yyyy")} — {slotLabel}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="deliveryDate">Delivery Date</Label>
          <Input
            id="deliveryDate"
            type="date"
            min={today}
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            required
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="deliverySlot">4-Hour Slot</Label>
          <Select value={deliverySlot} onValueChange={setDeliverySlot}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DELIVERY_SLOTS.map((slot) => (
                <SelectItem key={slot.value} value={slot.value}>
                  {slot.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : currentDeliveryDate ? "Update Slot" : "Set Delivery Slot"}
        </Button>
      </form>
    </div>
  );
}
