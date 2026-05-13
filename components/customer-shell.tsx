"use client";

import { CustomerHeader, CustomerMobileNav, CustomerSidebar } from "@/components/customer-nav";

export default function CustomerShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="customer-portal min-h-screen text-foreground">
      <CustomerHeader />
      <div className="mx-auto flex w-full max-w-[1640px] gap-6 px-0 lg:px-5">
        <CustomerSidebar />
        <main className="min-w-0 flex-1 pb-28 lg:pb-10">{children}</main>
      </div>
      <CustomerMobileNav />
    </div>
  );
}
