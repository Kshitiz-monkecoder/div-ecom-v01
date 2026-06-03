import { requireAuth } from "@/lib/auth";
import { CustomerHeader, CustomerMobileNav, CustomerSidebar } from "@/components/customer-nav";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="flex min-h-screen bg-[#f5f5f0] text-foreground">
      {/* Sidebar owns the entire left edge */}
      <CustomerSidebar />

      {/* Right column: header on top, content below */}
      <div className="flex flex-1 min-w-0 flex-col">
        <CustomerHeader />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      <CustomerMobileNav />
    </div>
  );
}