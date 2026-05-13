"use client";

import { useState } from "react";
import type { FormEvent } from "react";
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateOrderDeliverySlot(orderId, new Date(deliveryDate), deliverySlot);
      toast.success("Delivery slot updated successfully");
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
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <span className="font-semibold">Current slot:</span>{" "}
          {format(new Date(currentDeliveryDate), "MMM dd, yyyy")} - {slotLabel}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <div className="space-y-2">
          <Label htmlFor="deliveryDate" className="text-sm font-semibold text-slate-700">
            Delivery date
          </Label>
          <Input
            id="deliveryDate"
            type="date"
            min={today}
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            required
            className="h-12 rounded-2xl border-slate-200 bg-white shadow-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deliverySlot" className="text-sm font-semibold text-slate-700">
            4-hour slot
          </Label>
          <Select value={deliverySlot} onValueChange={setDeliverySlot}>
            <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-white shadow-none">
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

        <Button type="submit" disabled={loading} className="h-12 rounded-2xl bg-primary px-5 text-white hover:bg-slate-800">
          {loading ? "Updating..." : currentDeliveryDate ? "Update slot" : "Set slot"}
        </Button>
      </form>
    </div>
  );
}
