"use client";

import { CheckCircle2, ShieldCheck, SunMedium, Zap } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import type { ReactNode } from "react";

function TrustItem({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/10 p-4 text-sm font-semibold text-white backdrop-blur">
      <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-white/10 text-orange-200">
        {icon}
      </div>
      {title}
    </div>
  );
}

export function LoginHero() {
  const { t } = useLanguage();

  return (
    <section className="max-w-4xl text-white">
      <div className="mt-16 max-w-3xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-100 backdrop-blur">
          <ShieldCheck className="size-3.5" />
          {t("login.tagline")}
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
          {t("login.hero")}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/68">
          {t("login.heroDesc")}
        </p>
      </div>

      <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
        <TrustItem icon={<SunMedium className="size-5" />} title={t("login.trust1")} />
        <TrustItem icon={<Zap className="size-5" />}       title={t("login.trust2")} />
        <TrustItem icon={<CheckCircle2 className="size-5" />} title={t("login.trust3")} />
      </div>
    </section>
  );
}