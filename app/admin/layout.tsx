import { AdminNav, AdminHeader } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/proxy";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminNav />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
