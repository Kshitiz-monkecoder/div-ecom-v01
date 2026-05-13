"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Package } from "lucide-react";
import { CreateTicketForm } from "@/components/create-ticket-form";
import { Button } from "@/components/ui/button";
import { CustomerCard, CustomerPage, CustomerPageHeader, EmptyState } from "@/components/customer-portal-ui";
import { type Order, type OrderItem, type Product } from "@/types";

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

  return (
    <CustomerPage className="space-y-8">
      <div>
        <Button asChild variant="ghost" className="rounded-full text-muted-foreground hover:bg-white/70 hover:text-orange-900">
          <Link href="/tickets">
            <ArrowLeft className="size-4" />
            Back to support
          </Link>
        </Button>
      </div>

      <CustomerPageHeader
        eyebrow="Create support ticket"
        title="Tell us what needs attention"
        description="A structured ticket helps the support team route your request faster. Choose the category, attach photos, and connect it to the right order."
      />

      {orders.length === 0 ? (
        <EmptyState
          title="You need an order to raise a ticket"
          description="Support tickets are linked to an existing order so our team can see project context."
          icon={<Package className="size-5" />}
          action={
            <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-slate-800">
              <Link href="/orders">View orders</Link>
            </Button>
          }
        />
      ) : inCooldown ? (
        <EmptyState
          title="Please wait before creating another ticket"
          description={`You can create a new ticket in ${formatRemaining(remainingMs)}.`}
          icon={<Clock className="size-5" />}
          action={
            <Button variant="outline" className="rounded-full bg-white" onClick={() => router.push("/tickets")}>
              Back to tickets
            </Button>
          }
        />
      ) : (
        <CustomerCard className="mx-auto w-full max-w-4xl p-5 sm:p-8">
          <CreateTicketForm orders={orders} />
        </CustomerCard>
      )}
    </CustomerPage>
  );
}
