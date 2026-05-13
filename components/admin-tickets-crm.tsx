"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Clock,
  User,
  Send,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Filter,
} from "lucide-react";
import { updateTicketStatus } from "@/app/actions/tickets";
import { TICKET_STATUSES, type TicketStatus } from "@/types";
import { parseTicketSubCategories } from "@/lib/ticket-subcategories";

interface Message {
  id: string;
  message: string;
  senderRole: "ADMIN" | "USER";
  senderName?: string;
  createdAt: string;
  imageUrls?: string[];
}

interface Ticket {
  id: string;
  category: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt?: string;
  user: { id: string; name: string; phone: string; email?: string | null };
  order?: { id: string; createdAt: string; items: any[] } | null;
  images?: any[];
  statusHistory?: any[];
  subCategories?: string;
  messages?: Message[];
}

interface AdminTicketsCRMProps {
  tickets: Ticket[];
  statusFilter?: string;
  selectedTicketId?: string;
  allStatuses: TicketStatus[];
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-100 text-amber-700 border-amber-200",
  RESOLVED: "bg-green-100 text-green-700 border-green-200",
  CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
};

function useTicketMessages(ticketId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      // Messages may not exist yet — not a fatal error
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  return { messages, loading, refetch: fetch_, setMessages };
}

function TicketListItem({
  ticket,
  isSelected,
  onClick,
}: {
  ticket: Ticket;
  isSelected: boolean;
  onClick: () => void;
}) {
  const lastUpdated = ticket.updatedAt || ticket.createdAt;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-border transition-colors hover:bg-muted/60 ${
        isSelected ? "bg-primary/5 border-l-2 border-l-primary" : "border-l-2 border-l-transparent"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="font-medium text-sm truncate">{ticket.user.name}</span>
        <span className="text-[11px] text-muted-foreground shrink-0">
          {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${STATUS_COLORS[ticket.status] || "bg-gray-100 text-gray-600"}`}
        >
          {ticket.status.replace("_", " ")}
        </span>
        <span className="text-xs text-muted-foreground truncate">{ticket.category}</span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-1">{ticket.description}</p>
    </button>
  );
}

function ConversationPanel({ ticket }: { ticket: Ticket }) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, loading: messagesLoading, refetch, setMessages } = useTicketMessages(ticket.id);

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<TicketStatus>(ticket.status);
  const [statusNote, setStatusNote] = useState("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply.trim() }),
      });
      if (!res.ok) throw new Error("Failed to send");
      const newMsg = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: newMsg.id || Date.now().toString(),
          message: reply.trim(),
          senderRole: "ADMIN",
          senderName: "Support Team",
          createdAt: new Date().toISOString(),
        },
      ]);
      setReply("");
      toast.success("Reply sent successfully");
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (newStatus === ticket.status && !statusNote.trim()) return;
    setUpdatingStatus(true);
    try {
      await updateTicketStatus(ticket.id, newStatus, statusNote || undefined);
      toast.success("Status updated");
      setStatusNote("");
      router.refresh();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Build chronological thread: initial description + status history + messages
  const thread: Array<{
    id: string;
    type: "customer_initial" | "message" | "status_update";
    content: string;
    sender: string;
    role: "ADMIN" | "USER" | "SYSTEM";
    createdAt: string;
    images?: string[];
    status?: string;
  }> = [];

  // Initial complaint
  thread.push({
    id: "initial",
    type: "customer_initial",
    content: ticket.description,
    sender: ticket.user.name,
    role: "USER",
    createdAt: ticket.createdAt,
    images: ticket.images?.map((img: any) => img.url || img) ?? [],
  });

  // Status history entries
  (ticket.statusHistory ?? []).forEach((h: any) => {
    if (h.note) {
      thread.push({
        id: `sh-${h.id}`,
        type: "status_update",
        content: h.note,
        sender: h.createdBy?.name || "Support Team",
        role: "ADMIN",
        createdAt: h.createdAt,
        status: h.status,
        images: (() => {
          try { return JSON.parse(h.imagesJson || "[]"); } catch { return []; }
        })(),
      });
    }
  });

  // Realtime messages
  messages.forEach((m) => {
    thread.push({
      id: m.id,
      type: "message",
      content: m.message,
      sender: m.senderRole === "ADMIN" ? "Support Team" : ticket.user.name,
      role: m.senderRole,
      createdAt: m.createdAt,
    });
  });

  thread.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const subCategories = parseTicketSubCategories(ticket.subCategories);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-background">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold">{ticket.category}</h2>
              <StatusBadge status={ticket.status} type="ticket" />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="font-medium text-foreground">{ticket.user.name}</span>
              {" · "}
              {ticket.user.phone}
              {ticket.user.email && ` · ${ticket.user.email}`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Opened {format(new Date(ticket.createdAt), "dd MMM yyyy, HH:mm")}
              {" · "}
              <span className="font-mono text-[11px] opacity-70">#{ticket.id.slice(-8).toUpperCase()}</span>
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={refetch}
            className="shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>

        {subCategories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {subCategories.map((sc, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {sc}
              </Badge>
            ))}
          </div>
        )}

        {ticket.order && (
          <div className="mt-2 text-xs text-muted-foreground">
            Related order:{" "}
            <a
              href={`/admin/orders/${ticket.order.id}`}
              className="text-primary hover:underline"
            >
              #{ticket.order.id.slice(-8).toUpperCase()}
            </a>
          </div>
        )}
      </div>

      {/* Messages thread */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-muted/20">
        {messagesLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading conversation…
          </div>
        ) : (
          thread.map((item) => {
            const isAdmin = item.role === "ADMIN";
            return (
              <div
                key={item.id}
                className={`flex flex-col gap-1 ${isAdmin ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {!isAdmin && <User className="h-3 w-3" />}
                  <span className="font-medium">{item.sender}</span>
                  {item.type === "status_update" && item.status && (
                    <Badge variant="outline" className="text-[10px] py-0">
                      Status → {item.status.replace("_", " ")}
                    </Badge>
                  )}
                  <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isAdmin
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : item.type === "customer_initial"
                      ? "bg-background border border-border rounded-tl-sm"
                      : "bg-background border border-border rounded-tl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{item.content}</p>
                  {(item.images ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.images!.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-20 h-20 rounded overflow-hidden border border-white/20"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`attachment ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply box */}
      <div className="border-t border-border bg-background px-6 py-4 space-y-3">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your reply to the customer..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={2}
            className="resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSendReply();
            }}
          />
          <Button
            onClick={handleSendReply}
            disabled={!reply.trim() || sending}
            className="shrink-0 self-end"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">Ctrl+Enter to send</p>

        {/* Status update */}
        <details className="group">
          <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1 select-none">
            <ChevronRight className="h-3 w-3 group-open:rotate-90 transition-transform" />
            Update ticket status
          </summary>
          <div className="mt-3 space-y-2 pt-2 border-t border-border">
            <div className="flex gap-2">
              <Select
                value={newStatus}
                onValueChange={(v) => setNewStatus(v as TicketStatus)}
              >
                <SelectTrigger className="text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="text-sm">
                      {s.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                onClick={handleUpdateStatus}
                disabled={updatingStatus}
                className="shrink-0"
              >
                {updatingStatus ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                <span className="ml-1.5">Update</span>
              </Button>
            </div>
            <Textarea
              placeholder="Optional internal note..."
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              rows={2}
              className="resize-none text-sm"
            />
          </div>
        </details>
      </div>
    </div>
  );
}

export function AdminTicketsCRM({
  tickets,
  statusFilter,
  selectedTicketId,
  allStatuses,
}: AdminTicketsCRMProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(
    selectedTicketId || (tickets[0]?.id ?? null)
  );

  const selectedTicket = tickets.find((t) => t.id === selectedId) || null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    router.replace(`/admin/tickets?${statusFilter ? `status=${statusFilter}&` : ""}id=${id}`, {
      scroll: false,
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Page title */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <span className="text-sm text-muted-foreground">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap mb-4 shrink-0">
        <a
          href="/admin/tickets"
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !statusFilter
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All
        </a>
        {allStatuses.map((s) => (
          <a
            key={s}
            href={`/admin/tickets?status=${s}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s.replace("_", " ")}
          </a>
        ))}
      </div>

      {/* Split panel */}
      <div className="flex flex-1 overflow-hidden rounded-lg border border-border bg-background min-h-0">
        {/* Left: ticket list */}
        <div className="w-80 shrink-0 border-r border-border overflow-y-auto">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground gap-2">
              <MessageSquare className="h-8 w-8 opacity-40" />
              <p className="text-sm">No tickets found</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <TicketListItem
                key={ticket.id}
                ticket={ticket}
                isSelected={selectedId === ticket.id}
                onClick={() => handleSelect(ticket.id)}
              />
            ))
          )}
        </div>

        {/* Right: conversation */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {selectedTicket ? (
            <ConversationPanel ticket={selectedTicket} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
              <MessageSquare className="h-12 w-12 opacity-30" />
              <p className="text-sm">Select a ticket to view the conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
