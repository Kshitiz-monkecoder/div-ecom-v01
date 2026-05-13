"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";

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

export function CreateTicketButton() {
  const { t } = useLanguage();
  const [remainingMs, setRemainingMs] = useState(() => getRemainingMs());

  useEffect(() => {
    const interval = setInterval(() => {
      const r = getRemainingMs();
      setRemainingMs(r);
      if (r <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (remainingMs > 0) {
    return (
      <Button disabled variant="secondary" className="h-11 rounded-full px-5">
        {t("support.newComplaint")} - {formatRemaining(remainingMs)}
      </Button>
    );
  }

  return (
    <Button asChild className="h-11 rounded-full bg-primary px-5 text-white hover:bg-slate-800">
      <Link href="/tickets/new">
        <Plus className="size-4" />
        {t("support.newComplaint")}
      </Link>
    </Button>
  );
}
