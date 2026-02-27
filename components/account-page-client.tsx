"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, Bell, Globe, Lock, LogOut } from "lucide-react";
import { format } from "date-fns";

type AccountPageClientProps = {
  name: string;
  email: string | null;
  phone: string;
  createdAt: Date;
};

function formatDate(date: Date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return format(d, "MMMM dd, yyyy");
}

export function AccountPageClient({ name, email, phone, createdAt }: AccountPageClientProps) {
  const { t } = useLanguage();
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold">{t("account.title")}</h1>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="text-lg font-semibold">{t("account.profile")}</h2>
          <div className="space-y-3">
            <p className="font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">
              {t("account.phone")}: {phone}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("account.email")}: {email || "—"}
            </p>
            <p className="text-sm text-muted-foreground">
              Member since: {formatDate(createdAt)}
            </p>
          </div>
          <Button variant="outline" size="sm" className="min-h-[48px]" asChild>
            <Link href="/account">{t("account.updateProfile")}</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Quick links</h2>
        <ul className="space-y-2">
          <li>
            <Button variant="ghost" className="w-full justify-start min-h-[48px]" asChild>
              <Link href="/orders">
                <FileText className="h-4 w-4 mr-2" />
                {t("account.downloadWarranty")}
              </Link>
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start min-h-[48px]" asChild>
              <Link href="/orders">
                <Download className="h-4 w-4 mr-2" />
                {t("account.downloadInvoice")}
              </Link>
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start min-h-[48px]" asChild>
              <Link href="/orders">{t("account.subsidyStatus")}</Link>
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start min-h-[48px]" asChild>
              <Link href="/account">
                <Bell className="h-4 w-4 mr-2" />
                {t("account.notifications")}
              </Link>
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start min-h-[48px]" asChild>
              <Link href="/account">
                <Globe className="h-4 w-4 mr-2" />
                {t("account.changeLanguage")}
              </Link>
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start min-h-[48px]" asChild>
              <Link href="/account">
                <Lock className="h-4 w-4 mr-2" />
                {t("account.changePassword")}
              </Link>
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className="w-full justify-start min-h-[48px] text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t("account.signOut")}
            </Button>
          </li>
        </ul>
      </div>
    </div>
  );
}
