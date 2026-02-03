"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateTicketStatus } from "@/app/actions/tickets";
import { TicketStatus } from "@prisma/client";
import { TICKET_STATUSES } from "@/types";

interface TicketStatusFormProps {
  ticketId: string;
  currentStatus: TicketStatus;
}

export function TicketStatusForm({ ticketId, currentStatus }: TicketStatusFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<TicketStatus>(currentStatus);
  const [note, setNote] = useState("");
  const [statusImages, setStatusImages] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrls: string[] = [];

      if (statusImages.length > 0) {
        const uploadData = new FormData();
        statusImages.forEach((file) => uploadData.append("images", file));

        const uploadRes = await fetch("/api/upload-ticket-images", {
          method: "POST",
          body: uploadData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({}));
          throw new Error(errorData?.error || "Failed to upload images");
        }

        const uploadJson = await uploadRes.json();
        imageUrls = Array.isArray(uploadJson?.urls) ? uploadJson.urls : [];
      }

      await updateTicketStatus(ticketId, status, note, imageUrls);
      toast.success("Ticket status updated successfully!");
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
        onValueChange={(value) => setStatus(value as TicketStatus)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TICKET_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s.replace("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="space-y-2">
        <Textarea
          placeholder="Optional note for this status update..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setStatusImages(Array.from(e.target.files || []))}
        />
      </div>

      <Button type="submit" disabled={loading || status === currentStatus}>
        {loading ? "Updating..." : "Update Status"}
      </Button>
    </form>
  );
}

