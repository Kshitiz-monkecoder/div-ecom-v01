"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import {
  Bell,
  ChevronRight,
  Download,
  FileText,
  Globe,
  Lock,
  LogOut,
  Phone,
  ShieldCheck,
  UserRound,
  Mail,
  MapPin,
  Edit2,
  CheckCircle,
  Activity,
  KeyRound,
  MonitorSmartphone,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type AccountPageClientProps = {
  name: string;
  email: string | null;
  phone: string;
  createdAt: Date;
};

function formatDate(date: Date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "--";
  return format(d, "dd MMM yyyy");
}

function memberDuration(date: Date, t: (k: string, vars?: Record<string, string>) => string) {
  const now = new Date();
  const years = now.getFullYear() - date.getFullYear();
  if (years < 1) return t("account.lessThanOneYear");
  return t("account.yearsWithDivy", { years: String(years) });
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
    <div className="flex-1 min-w-0 px-4 sm:px-6 py-5 space-y-5">

        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("account.pageTitle")}</h1>
          <p className="text-sm text-gray-400 mt-1">{t("account.pageDesc")}</p>
        </div>

        {/* Profile Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Avatar Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="size-14 rounded-full bg-orange-500 flex items-center justify-center text-white text-lg font-bold shrink-0">
              {initials || <UserRound className="size-6" />}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base leading-tight">{name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{phone}</p>
              <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <CheckCircle className="size-3" /> {t("account.verified")}
              </span>
              <p className="text-[11px] text-gray-400 mt-1">{t("account.divyPowerCustomer")}</p>
            </div>
          </div>

          {/* Member Since */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{t("account.memberSince")}</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{formatDate(createdAt)}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{memberDuration(createdAt, t)}</p>
            </div>
          </div>

          {/* Preferred Language */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="size-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
              <Globe className="size-5 text-purple-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 font-medium">{t("account.preferredLanguage")}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xl font-bold text-gray-900">{locale === "hi" ? "Hindi" : "English"}</p>
                <button
                  onClick={() => setLocale(locale === "hi" ? "en" : "hi")}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full hover:bg-orange-100 transition-colors"
                >
                  <Edit2 className="size-2.5" /> {t("account.edit")}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {locale === "hi" ? t("account.contentInHindi") : t("account.contentInEnglish")}
              </p>
            </div>
          </div>

        </div>

        {/* Main Two-Column Grid */}
        <div className="">

          {/* ── Left Column ── */}
          <div className="space-y-5">

            {/* Contact Information */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">{t("account.contactInformation")}</h2>
                <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-orange-600 transition-colors">
                  <Edit2 className="size-3.5" /> {t("account.edit")}
                </button>
              </div>
              <div className="space-y-3">
                <ContactRow icon={<Phone className="size-4 text-gray-400" />} label={t("account.phoneNumber")} value={phone} />
                <ContactRow icon={<Mail className="size-4 text-gray-400" />} label={t("account.emailAddress")} value={email || "--"} />
                <ContactRow icon={<MapPin className="size-4 text-gray-400" />} label={t("account.address2")} value="--" />
              </div>
            </div>

            {/* Sign Out */}
            <div className="bg-white rounded-2xl border border-orange-100 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-orange-600">{t("account.signOutFromAll")}</p>
                  <p className="text-xs text-orange-500/80 mt-1">{t("account.signOutFromAllDesc")}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSignOut}
                  className="rounded-full border-orange-200 text-orange-600 bg-white hover:bg-orange-50 hover:text-orange-700 shrink-0 gap-2"
                >
                  <LogOut className="size-4" />
                  {t("account.signOutEverywhere")}
                </Button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}


/* ── Sub-components ── */

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
      <div className="size-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}

function SecurityRow({
  icon,
  label,
  value,
  badge,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: string;
  href?: string;
  onClick?: () => void;
}) {
  const inner = (
    <div className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-xl px-2 -mx-2 transition-colors cursor-pointer">
      <div className="size-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{value}</p>
      </div>
      {badge && (
        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">
          {badge}
        </span>
      )}
      <ChevronRight className="size-4 text-gray-300 shrink-0" />
    </div>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  if (onClick) return <button className="w-full text-left" onClick={onClick}>{inner}</button>;
  return inner;
}

function QuickActionRow({
  icon,
  iconBg,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
    >
      <div className={cn("size-9 rounded-full flex items-center justify-center shrink-0", iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <ChevronRight className="size-4 text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" />
    </Link>
  );
}

function ActivityRow({
  icon,
  iconBg,
  label,
  time,
  badge,
  badgeColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  time: string;
  badge: string;
  badgeColor: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className={cn("size-9 rounded-full flex items-center justify-center shrink-0", iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{time}</p>
      </div>
      <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0", badgeColor)}>
        {badge}
      </span>
    </div>
  );
}