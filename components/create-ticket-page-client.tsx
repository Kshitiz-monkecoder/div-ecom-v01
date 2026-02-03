"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreateTicketForm } from "@/components/create-ticket-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Order, OrderItem, Product } from "@prisma/client";

const STORAGE_KEY = "ticketCreateCooldownUntil";

function getRemainingMs(): number {
  if (typeof window === "undefined") return 0;
  const until = localStorage.getItem(STORAGE_KEY);
  if (!until) return 0;
  const remaining = Number(until) - Date.now();
  return remaining > 0 ? remaining : 0;
}

function formatRemaining(ms: number): string {
  const sec = Math.ceil(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface CreateTicketPageClientProps {
  orders: (Order & {
    items: Array<OrderItem & { product: Product | null }>;
  })[];
}

export function CreateTicketPageClient({ orders }: CreateTicketPageClientProps) {
  const router = useRouter();
  const [remainingMs, setRemainingMs] = useState(() => getRemainingMs());

  useEffect(() => {
    const interval = setInterval(() => {
      const r = getRemainingMs();
      setRemainingMs(r);
      if (r <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const inCooldown = remainingMs > 0;

  if (inCooldown) {
    return (
      <div className="max-w-2xl">
        <div className="mb-6">
          <Link href="/tickets">
            <Button variant="ghost">← Back to Tickets</Button>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6 text-center">
          <h1 className="text-3xl font-bold mb-4">Create Support Ticket</h1>
          <p className="text-muted-foreground mb-4">
            Please wait <strong>{formatRemaining(remainingMs)}</strong> before creating another ticket.
          </p>
          <Button variant="outline" onClick={() => router.push("/tickets")}>
            Back to Tickets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/tickets">
          <Button variant="ghost">← Back to Tickets</Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
        <h1 className="text-3xl font-bold mb-6">Create Support Ticket</h1>
        <CreateTicketForm orders={orders} />
      </div>
    </div>
  );
}
