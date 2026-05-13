"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { CustomerCard, CustomerPage, CustomerPageHeader, MetricCard, SectionHeader } from "@/components/customer-portal-ui";
import { Bell, Download, FileText, Globe, Lock, LogOut, Phone, ShieldCheck, UserRound } from "lucide-react";
import { format } from "date-fns";

type AccountPageClientProps = {
  name: string;
  email: string | null;
  phone: string;
  createdAt: Date;
};

function formatDate(date: Date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "--";
  return format(d, "MMMM dd, yyyy");
}

export function AccountPageClient({ name, email, phone, createdAt }: AccountPageClientProps) {
  const { t, locale, setLocale } = useLanguage();
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <CustomerPage className="space-y-8">
      <CustomerPageHeader
        eyebrow="Account"
        title={t("account.title")}
        description="Manage your customer identity, language preference, document shortcuts, and secure session access."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Member since" value={formatDate(createdAt)} icon={<ShieldCheck className="size-5" />} detail="Your customer account creation date." tone="green" />
        <MetricCard label="Login method" value="WhatsApp OTP" icon={<Phone className="size-5" />} detail="Secure one-time code authentication." tone="blue" />
        <MetricCard label="Language" value={locale === "hi" ? "Hindi" : "English"} icon={<Globe className="size-5" />} detail="Portal content preference." tone="solar" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <CustomerCard className="overflow-hidden">
          <div className="bg-primary p-6 text-white">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-white/10 text-xl font-semibold">
              {initials || <UserRound className="size-7" />}
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">{name}</h2>
            <p className="mt-1 text-sm text-white/60">Divy Power customer</p>
          </div>
          <div className="space-y-3 p-5">
            <ProfileRow label={t("account.phone")} value={phone} />
            <ProfileRow label={t("account.email")} value={email || "--"} />
            <ProfileRow label="Member since" value={formatDate(createdAt)} />
          </div>
        </CustomerCard>

        <div className="space-y-6">
          <CustomerCard className="p-5">
            <SectionHeader
              title="Document shortcuts"
              description="Jump to the order workspace to open available warranty cards, invoices, and subsidy status."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <ActionLink href="/orders" icon={<FileText className="size-5" />} title={t("account.downloadWarranty")} description="Open warranty documents from orders." />
              <ActionLink href="/orders" icon={<Download className="size-5" />} title={t("account.downloadInvoice")} description="Find invoices and project files." />
              <ActionLink href="/orders" icon={<ShieldCheck className="size-5" />} title={t("account.subsidyStatus")} description="Review subsidy and project status." />
              <ActionLink href="/tickets" icon={<Bell className="size-5" />} title={t("account.notifications")} description="Use tickets as your active update stream." />
            </div>
          </CustomerCard>

          <CustomerCard className="p-5">
            <SectionHeader
              title="Preferences and security"
              description="Keep account actions clear and predictable."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocale(locale === "hi" ? "en" : "hi")}
                className="h-auto justify-start rounded-2xl border-slate-200 bg-white p-4 text-left"
              >
                <Globe className="size-5 text-orange-600" />
                <span>
                  <span className="block font-semibold">{t("account.changeLanguage")}</span>
                  <span className="mt-1 block text-xs font-normal text-slate-500">Switch between English and Hindi.</span>
                </span>
              </Button>
              <Button asChild variant="outline" className="h-auto justify-start rounded-2xl border-slate-200 bg-white p-4 text-left">
                <Link href="/account">
                  <Lock className="size-5 text-slate-500" />
                  <span>
                    <span className="block font-semibold">{t("account.changePassword")}</span>
                    <span className="mt-1 block text-xs font-normal text-slate-500">OTP login keeps this account passwordless.</span>
                  </span>
                </Link>
              </Button>
            </div>
          </CustomerCard>

          <CustomerCard className="border-rose-100 bg-rose-50/80 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-rose-950">Sign out securely</h2>
                <p className="mt-1 text-sm leading-6 text-rose-800/75">End this session on the current device.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleSignOut}
                className="rounded-full border-rose-200 bg-white text-rose-700 hover:bg-rose-100 hover:text-rose-800"
              >
                <LogOut className="size-4" />
                {t("account.signOut")}
              </Button>
            </div>
          </CustomerCard>
        </div>
      </section>
    </CustomerPage>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function ActionLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-white customer-focus-ring"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-600">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold text-orange-900">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
      </span>
    </Link>
  );
}
