import { redirect } from "next/navigation";

// Deep-link redirect: individual ticket URLs now open in the CRM split panel
export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/tickets?id=${id}`);
}
