"use client";

import { CustomerNav, CustomerHeader } from "@/components/customer-nav";

export default function CustomerShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CustomerHeader />
      <main className="flex-1 p-4 md:p-8 overflow-auto pb-24 md:pb-8">
        {children}
      </main>
      <CustomerNav />
    </div>
  );
}
