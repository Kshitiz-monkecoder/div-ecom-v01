import { getAllUsers } from "@/app/actions/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Users</h1>

      <div className="bg-white dark:bg-gray-900 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Tickets</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user._count.orders}</TableCell>
                <TableCell>{user._count.tickets}</TableCell>
                <TableCell>
                  {format(new Date(user.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <Link href={`/admin/users/${user.id}`}>
                    <span className="text-primary hover:underline">View</span>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {users.length === 0 && (
          <p className="text-center text-gray-500 py-8">No users found.</p>
        )}
      </div>
    </div>
  );
}

