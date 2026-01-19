import { Badge } from "@/components/ui/badge";
import { OrderStatus, TicketStatus } from "@prisma/client";

interface StatusBadgeProps {
  status: OrderStatus | TicketStatus;
  type: "order" | "ticket";
}

const statusColors: Record<string, string> = {
  // Order statuses
  NEW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  CONTACTED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  CONFIRMED: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  INSTALLED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  // Ticket statuses
  OPEN: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  RESOLVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  CLOSED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = statusColors[status] || "bg-gray-100 text-gray-800";
  
  return (
    <Badge className={colorClass} variant="secondary">
      {status.replace("_", " ")}
    </Badge>
  );
}

