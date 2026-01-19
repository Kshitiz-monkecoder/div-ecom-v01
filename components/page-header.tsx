import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type PageHeaderAction = {
  label: string;
  href: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
};

export function PageHeader({
  title,
  subtitle,
  greeting,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  greeting?: string;
  actions?: PageHeaderAction[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 mb-8 border-b border-border/60",
        "md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        {greeting ? (
          <p className="text-sm text-muted-foreground">{greeting}</p>
        ) : null}
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
            {subtitle}
          </p>
        ) : null}
      </div>

      {actions?.length ? (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Button
              key={`${action.href}-${action.label}`}
              asChild
              variant={action.variant ?? "outline"}
            >
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

