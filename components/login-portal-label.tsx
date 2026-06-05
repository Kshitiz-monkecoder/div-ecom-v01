"use client";

import { useLanguage } from "@/components/language-provider";

export function LoginPortalLabel() {
  const { t } = useLanguage();
  return (
    <span className="hidden text-sm font-semibold uppercase tracking-[0.18em] text-orange-200 sm:inline">
      {t("login.customerPortal")}
    </span>
  );
}