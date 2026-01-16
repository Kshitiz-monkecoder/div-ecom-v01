"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createOrder } from "@/app/actions/orders";

interface OrderFormProps {
  productId: string;
}

export function OrderForm({ productId }: OrderFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    phone: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createOrder({
        productId,
        ...formData,
      });
      toast.success("Order placed successfully!");
      router.push("/orders");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Place Order</h3>
      
      <div>
        <Label htmlFor="address">Installation Address *</Label>
        <Input
          id="address"
          required
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Enter installation address"
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Enter phone number"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any additional notes or requirements"
          rows={4}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Placing Order..." : "Place Order"}
      </Button>
    </form>
  );
}

