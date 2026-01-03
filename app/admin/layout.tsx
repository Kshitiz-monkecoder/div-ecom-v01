import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/middleware";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen flex">
      <AdminNav />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

