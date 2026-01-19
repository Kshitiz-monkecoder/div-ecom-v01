import { EditUserForm } from "@/components/edit-user-form";
import { getUserDetails } from "@/app/actions/admin";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserDetails(id);

  if (!user) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/users">
          <Button variant="ghost">← Back to Users</Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Edit User</h1>
      <EditUserForm
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        }}
      />
    </div>
  );
}

