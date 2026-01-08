import { getAllProductUserAssignments } from "@/app/actions/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import Link from "next/link";

export default async function AdminOrdersPage() {
  const assignments = await getAllProductUserAssignments();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Product Assignments</h1>

      <div className="bg-white dark:bg-gray-900 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Assigned Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/products/${assignment.product.id}/edit`} className="text-primary hover:underline">
                    {assignment.product.name}
                  </Link>
                  <div className="text-sm text-gray-500">{assignment.product.capacity}</div>
                </TableCell>
                <TableCell>
                  <Link href={`/admin/users/${assignment.user.id}`} className="text-primary hover:underline">
                    {assignment.user.name}
                  </Link>
                  <div className="text-sm text-gray-500">{assignment.user.email || assignment.user.phone}</div>
                </TableCell>
                <TableCell>
                  {format(new Date(assignment.createdAt), "MMM dd, yyyy")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {assignments.length === 0 && (
          <p className="text-center text-gray-500 py-8">No product assignments found.</p>
        )}
      </div>
    </div>
  );
}

