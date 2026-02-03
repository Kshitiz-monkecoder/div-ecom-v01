"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  const [supportImages, setSupportImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    category: "" as typeof TICKET_CATEGORIES[number] | "",
    description: "",
    orderId: "",
  });
  const minDescriptionLength = 100;
  const descriptionLength = formData.description.trim().length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (descriptionLength < minDescriptionLength) {
      toast.error(`Description must be at least ${minDescriptionLength} characters.`);
      return;
    }

    if (supportImages.length === 0) {
      toast.error("Please upload at least one supporting image.");
      return;
    }

    if (!formData.orderId) {
      toast.error("Please select a related order.");
      return;
    }

    setLoading(true);

    try {
      const uploadData = new FormData();
      supportImages.forEach((file) => uploadData.append("images", file));

      const uploadRes = await fetch("/api/upload-ticket-images", {
        method: "POST",
        body: uploadData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({}));
        throw new Error(errorData?.error || "Failed to upload images");
      }

      const uploadJson = await uploadRes.json();
      const imageUrls = Array.isArray(uploadJson?.urls) ? uploadJson.urls : [];

      if (imageUrls.length === 0) {
        throw new Error("No image URLs returned from upload");
      }

      const ticket = await createTicket({
        category: formData.category as typeof TICKET_CATEGORIES[number],
        description: formData.description,
        orderId: formData.orderId,
        images: imageUrls,
      });
      toast.success("Ticket created successfully!");
      if (typeof window !== "undefined") {
        const cooldownMs = 2 * 60 * 1000;
        localStorage.setItem("ticketCreateCooldownUntil", String(Date.now() + cooldownMs));
      }
      router.push(`/tickets/${ticket.id}`);
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
        <Label htmlFor="order">Related Order *</Label>
        <Select
          value={formData.orderId}
          onValueChange={(value) => setFormData({ ...formData, orderId: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an order" />
          </SelectTrigger>
          <SelectContent>
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
          minLength={minDescriptionLength}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your issue or question..."
          rows={6}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          {descriptionLength}/{minDescriptionLength} characters minimum
        </p>
      </div>

      <div>
        <Label htmlFor="supportImages">Supporting images *</Label>
        <Input
          id="supportImages"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setSupportImages(Array.from(e.target.files || []))}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Please upload at least one image showing the issue.
        </p>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating Ticket..." : "Create Ticket"}
      </Button>
    </form>
  );
}

