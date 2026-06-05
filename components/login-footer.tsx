"use client";

import { useLanguage } from "@/components/language-provider";

export function LoginFooter() {
  const { t } = useLanguage();
  return (
    <p className="mt-5 text-center text-xs text-white/55">
      {t("login.footer")}
    </p>
  );
}