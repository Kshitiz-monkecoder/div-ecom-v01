import type { ReactNode } from "react";
import { ArrowRight, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function CustomerPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full max-w-[1360px] mx-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-8", className)}>
      {children}
    </div>
  );
}

export function CustomerPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-3xl">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-semibold tracking-tight text-orange-900 sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

export function CustomerCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[1.5rem] border border-white/70 bg-white/90 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.55)] backdrop-blur-xl",
        className
      )}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-orange-900">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  icon,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  detail?: ReactNode;
  tone?: "neutral" | "solar" | "green" | "blue" | "dark";
}) {
  const tones = {
    neutral: "from-white to-slate-50 text-orange-900",
    solar: "from-amber-50 to-orange-50 text-orange-950",
    green: "from-orange-50 to-amber-50 text-orange-950",
    blue: "from-sky-50 to-cyan-50 text-sky-950",
    dark: "from-orange-900 to-orange-800 text-white",
  };

  return (
    <div className={cn("rounded-2xl border border-white/80 bg-gradient-to-br p-4 shadow-sm", tones[tone])}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={cn("text-xs font-medium", tone === "dark" ? "text-white/65" : "text-slate-500")}>
            {label}
          </p>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
        </div>
        {icon && (
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-xl",
              tone === "dark" ? "bg-white/10 text-white" : "bg-white/75 text-slate-700"
            )}
          >
            {icon}
          </div>
        )}
      </div>
      {detail && (
        <div className={cn("mt-3 text-xs", tone === "dark" ? "text-white/65" : "text-slate-500")}>
          {detail}
        </div>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[260px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-orange-200 bg-white/60 px-6 py-12 text-center",
        className
      )}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        {icon ?? <Inbox className="size-5" />}
      </div>
      <h3 className="text-base font-semibold text-orange-900">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function TextLink({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <a href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600  hover:text-orange-800">
      {children}
      <ArrowRight className="size-4" />
    </a>
  );
}
