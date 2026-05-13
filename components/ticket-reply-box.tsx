"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

interface TicketReplyBoxProps {
  ticketId: string;
}

export function TicketReplyBox({ ticketId }: TicketReplyBoxProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to send message");
      }

      toast.success("Message sent. Our support team will respond shortly.");
      setMessage("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
      <Textarea
        placeholder="Describe your follow-up issue or add more details..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        className="resize-none bg-background text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
        }}
        disabled={sending}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Our support team usually responds within 24 hours.
        </p>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          size="sm"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
          ) : (
            <Send className="h-4 w-4 mr-1.5" />
          )}
          Send Message
        </Button>
      </div>
    </div>
  );
}
