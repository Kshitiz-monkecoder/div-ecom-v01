"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string;
}

interface AssignUsersToProductFormProps {
  productId: string;
  productName: string;
  assignedUserIds: string[];
  allUsers: User[];
}

export function AssignUsersToProductForm({
  productId,
  productName,
  assignedUserIds,
  allUsers,
}: AssignUsersToProductFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    assignedUserIds
  );
  const router = useRouter();

  useEffect(() => {
    setSelectedUsers(assignedUserIds);
  }, [assignedUserIds]);

  const handleToggle = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/products/${productId}/assign-users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIds: selectedUsers }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to assign users");
        return;
      }

      toast.success("Users assigned successfully");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to assign users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
        >
          Assign to Users
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Product to Users</DialogTitle>
          <DialogDescription>
            Select which users can see and order &quot;{productName}&quot;.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {allUsers.length === 0 ? (
              <p className="text-gray-500">No users available.</p>
            ) : (
              allUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={user.id}
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => handleToggle(user.id)}
                    disabled={loading}
                  />
                  <Label
                    htmlFor={user.id}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {user.name} {user.email && `(${user.email})`} - {user.phone}
                  </Label>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Assignments"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

