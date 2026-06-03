import { requireAuth } from "@/lib/auth";
import { CustomerHeader, CustomerMobileNav, CustomerSidebar } from "@/components/customer-nav";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-foreground">
      <CustomerHeader />
      <div className="mx-auto flex w-full max-w-[1440px] gap-5 px-4 lg:px-6">
        <CustomerSidebar />
        <main className="min-w-0 flex-1 py-6 pb-28 lg:pb-10">{children}</main>
      </div>
      <CustomerMobileNav />
    </div>
  );
}