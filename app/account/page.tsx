import { Navbar } from "@/components/navbar";
import { getCurrentUser } from "@/lib/auth";
import { requireAuth } from "@/lib/middleware";
import { format } from "date-fns";
import { UserButton } from "@clerk/nextjs";

export default async function AccountPage() {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
            <UserButton />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p>{user.phone || "Not provided"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p className="capitalize">{user.role.toLowerCase()}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Member Since</p>
              <p>{format(new Date(user.createdAt), "MMMM dd, yyyy")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

