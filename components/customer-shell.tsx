"use client";

import { CustomerNav, CustomerHeader } from "@/components/customer-nav";

export default function CustomerShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomerHeader />
      <div className="flex flex-1 flex-col md:flex-row">
        <CustomerNav />
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
