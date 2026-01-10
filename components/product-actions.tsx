"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toggleProductStatus, deleteProduct } from "@/app/actions/products";
import { ParsedProduct } from "@/types";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string;
}

interface ProductActionsProps {
  product: ParsedProduct;
  assignedUserIds?: string[];
  allUsers?: User[];
}

export function ProductActions({ product, assignedUserIds = [], allUsers = [] }: ProductActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>(allUsers);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(assignedUserIds);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [userIdsLoaded, setUserIdsLoaded] = useState(false);

  // Fetch users when dialog opens
  useEffect(() => {
    if (assignDialogOpen && !usersLoaded) {
      fetch("/api/admin/users-for-assignment")
        .then((res) => res.json())
        .then((data) => {
          console.log("Users API response:", data); // Debug log
          if (data && data.users && Array.isArray(data.users)) {
            console.log("Setting users:", data.users.length); // Debug log
            setUsers(data.users);
            setUsersLoaded(true);
          } else {
            console.log("Unexpected response format:", data);
            setUsers([]);
            setUsersLoaded(true);
          }
        })
        .catch((error) => {
          console.error("Error loading users:", error);
          setUsers([]);
          setUsersLoaded(true);
        });
    }
  }, [assignDialogOpen, usersLoaded]);

  // Fetch assigned user IDs when dialog opens
  useEffect(() => {
    if (assignDialogOpen && !userIdsLoaded && product.id) {
      fetch(`/api/admin/products/${product.id}/assigned-users`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Assigned users data:", data); // Debug log
          if (data.userIds && Array.isArray(data.userIds)) {
            setSelectedUsers(data.userIds);
          } else {
            setSelectedUsers([]);
          }
          setUserIdsLoaded(true);
        })
        .catch((error) => {
          console.error("Error loading assigned users:", error);
          setSelectedUsers([]);
          setUserIdsLoaded(true);
        });
    }
  }, [assignDialogOpen, userIdsLoaded, product.id]);

  // Reset flags when dialog closes to allow fresh fetch next time
  useEffect(() => {
    if (!assignDialogOpen) {
      setUsersLoaded(false);
      setUserIdsLoaded(false);
    }
  }, [assignDialogOpen]);

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAssignUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${product.id}/assign-users`, {
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
      setAssignDialogOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to assign users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      await toggleProductStatus(product.id);
      toast.success(`Product ${product.isActive ? "deactivated" : "activated"} successfully!`);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }
    setLoading(true);
    try {
      await deleteProduct(product.id);
      toast.success("Product deleted successfully!");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={loading}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus}>
            {product.isActive ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            setAssignDialogOpen(true);
          }}>
            Assign to Users
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Product to Users</DialogTitle>
            <DialogDescription>
              Select which users can see and order &quot;{product.name}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {!usersLoaded ? (
                <p className="text-gray-500">Loading users...</p>
              ) : users.length === 0 ? (
                <p className="text-gray-500">No users available.</p>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={user.id}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleToggleUser(user.id)}
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
                onClick={() => setAssignDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleAssignUsers} disabled={loading}>
                {loading ? "Saving..." : "Save Assignments"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

