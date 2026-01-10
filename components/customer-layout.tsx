import { CustomerNav } from "@/components/customer-nav";
import { requireAuth } from "@/lib/middleware";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <CustomerNav />
      <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}
