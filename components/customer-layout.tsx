import { requireAuth } from "@/lib/auth";
import CustomerShell from "./customer-shell";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth(); // ✅ server-only

  return <CustomerShell>{children}</CustomerShell>;
}
