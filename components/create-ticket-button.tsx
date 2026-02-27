"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

  const disabled = remainingMs > 0;

  if (disabled) {
    return (
      <Button disabled variant="secondary">
        {t("support.newComplaint")} — {formatRemaining(remainingMs)}
      </Button>
    );
  }

  return (
    <Link href="/tickets/new">
      <Button className="min-h-[48px]">{t("support.newComplaint")}</Button>
    </Link>
  );
}
