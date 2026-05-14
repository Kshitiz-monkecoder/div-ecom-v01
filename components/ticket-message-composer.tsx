"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Send, Loader2, MessageSquare, RefreshCw, User, Headphones } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  message: string;
  senderRole: "ADMIN" | "USER";
  senderName?: string | null;
  createdAt: string;
  imageUrls?: string[];
}

interface TicketMessageComposerProps {
  ticketId: string;
  ticketStatus: string;
  /** Pre-seeded from SSR so the initial render is instant */
  initialMessages?: Message[];
}

export function TicketMessageComposer({
  ticketId,
  ticketStatus,
  initialMessages = [],
}: TicketMessageComposerProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const isClosed = ticketStatus === "CLOSED" || ticketStatus === "RESOLVED";

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch {
      // silent — messages are supplementary
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll every 30s so the customer sees admin replies without refreshing
    const interval = setInterval(fetchMessages, 30_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Failed to send");
      }

      const newMsg: Message = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: newMsg.id ?? Date.now().toString(),
          message: trimmed,
          senderRole: "USER",
          senderName: null,
          createdAt: new Date().toISOString(),
        },
      ]);
      setText("");
      toast.success("Message sent");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-[1.5rem] border border-white/80 bg-white/90 p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-orange-900">
            Conversation
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Send a message to the support team. We typically reply within a few hours.
          </p>
        </div>
        <button
          onClick={() => startTransition(fetchMessages)}
          className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          disabled={isPending}
          title="Refresh messages"
        >
          <RefreshCw className={`size-3.5 ${isPending ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Thread */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-orange-200 bg-white/65 py-10 text-center text-sm text-slate-400">
            <MessageSquare className="size-7 opacity-40" />
            No messages yet. Send one below.
          </div>
        ) : (
          messages.map((msg) => {
            const isAdmin = msg.senderRole === "ADMIN";
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 ${isAdmin ? "items-start" : "items-end"}`}
              >
                {/* Sender label */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  {isAdmin ? (
                    <Headphones className="size-3" />
                  ) : (
                    <User className="size-3" />
                  )}
                  <span className="font-medium">
                    {isAdmin ? (msg.senderName ?? "Support Team") : "You"}
                  </span>
                  <span>·</span>
                  <span title={format(new Date(msg.createdAt), "dd MMM yyyy, HH:mm")}>
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </span>
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isAdmin
                      ? "rounded-tl-sm bg-slate-100 text-slate-800"
                      : "rounded-tr-sm bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  {(msg.imageUrls ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.imageUrls!.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block size-16 overflow-hidden rounded-lg border border-white/20"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`attachment ${i + 1}`} className="size-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      {isClosed ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-400">
          This ticket is {ticketStatus.toLowerCase()}. You cannot send further messages.
        </div>
      ) : (
        <div className="mt-5 flex gap-2">
          <Textarea
            placeholder="Type your message to support..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            className="resize-none rounded-2xl text-sm"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!text.trim() || loading}
            className="shrink-0 self-end rounded-2xl"
            title="Send (Ctrl+Enter)"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      )}
      {!isClosed && (
        <p className="mt-2 text-center text-[11px] text-slate-400">Ctrl + Enter to send</p>
      )}
    </section>
  );
}
