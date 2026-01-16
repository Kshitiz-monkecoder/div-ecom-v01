"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTicket } from "@/app/actions/tickets";
import { TICKET_CATEGORIES } from "@/types";
import { Order, OrderItem, Product } from "@prisma/client";

interface CreateTicketFormProps {
  orders: (Order & {
    items: Array<OrderItem & { product: Product | null }>;
  })[];
}

export function CreateTicketForm({ orders }: CreateTicketFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: "" as typeof TICKET_CATEGORIES[number] | "",
    description: "",
    orderId: "none",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createTicket({
        category: formData.category as typeof TICKET_CATEGORIES[number],
        description: formData.description,
        orderId: formData.orderId === "none" ? undefined : formData.orderId,
      });
      toast.success("Ticket created successfully!");
      router.push("/tickets");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="category">Category *</Label>
        <Select
          value={formData.category}
          onValueChange={(value) =>
            setFormData({ ...formData, category: value as typeof TICKET_CATEGORIES[number] })
          }
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {TICKET_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="order">Related Order (Optional)</Label>
        <Select
          value={formData.orderId}
          onValueChange={(value) => setFormData({ ...formData, orderId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an order (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {orders.map((order) => (
              <SelectItem key={order.id} value={order.id}>
                {order.items.length === 1
                  ? order.items[0]?.product?.name || order.items[0]?.name || "Order"
                  : `${order.items.length} items`} - {new Date(order.createdAt).toLocaleDateString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your issue or question..."
          rows={6}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating Ticket..." : "Create Ticket"}
      </Button>
    </form>
  );
}

