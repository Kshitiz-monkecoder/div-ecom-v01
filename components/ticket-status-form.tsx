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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateTicketStatus(ticketId, status);
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

      <Button type="submit" disabled={loading || status === currentStatus}>
        {loading ? "Updating..." : "Update Status"}
      </Button>
    </form>
  );
}

