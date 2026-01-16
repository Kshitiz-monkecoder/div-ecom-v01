"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatus } from "@/app/actions/orders";
import { OrderStatus } from "@prisma/client";
import { ORDER_STATUSES } from "@/types";

interface OrderStatusFormProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusForm({ orderId, currentStatus }: OrderStatusFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(currentStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateOrderStatus(orderId, status);
      toast.success("Order status updated successfully!");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        value={status}
        onValueChange={(value) => setStatus(value as OrderStatus)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ORDER_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s.replace("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="submit" disabled={loading || status === currentStatus}>
        {loading ? "Updating..." : "Update Status"}
      </Button>
    </form>
  );
}

