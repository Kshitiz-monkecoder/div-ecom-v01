import CustomerLayout from "@/components/customer-layout";
import { getCurrentUser } from "@/lib/auth";
import { format } from "date-fns";

// Helper function to safely format dates
function formatDate(date?: string | Date | null) {
  if (!date) return "-";               // Handle missing date
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-"; // Handle invalid date
  return format(d, "MMMM dd, yyyy");
}

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <CustomerLayout>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">{user.name}</h2>
            <p className="text-gray-500">{user.email || "Not provided"}</p>
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
              <p>{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
