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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { deleteUser } from "@/app/actions/admin";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  capacity: string;
}

interface UserActionsProps {
  userId: string;
  userName: string;
  currentUserId?: string;
}

export function UserActions({ userId, userName, currentUserId }: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [assignmentsLoaded, setAssignmentsLoaded] = useState(false);
  const isCurrentUser = currentUserId === userId;

  // Fetch products when dialog opens
  useEffect(() => {
    if (assignDialogOpen && !productsLoaded) {
      fetch("/api/admin/products")
        .then((res) => res.json())
        .then((data) => {
          if (data.products && Array.isArray(data.products)) {
            setProducts(data.products);
            setProductsLoaded(true);
          }
        })
        .catch((error) => {
          console.error("Error loading products:", error);
          setProductsLoaded(true);
        });
    }
  }, [assignDialogOpen, productsLoaded]);

  // Fetch assigned products when dialog opens
  useEffect(() => {
    if (assignDialogOpen && !assignmentsLoaded) {
      fetch(`/api/admin/users/${userId}/assigned-products`)
        .then((res) => res.json())
        .then((data) => {
          if (data.productIds && Array.isArray(data.productIds)) {
            setSelectedProducts(data.productIds);
            setAssignmentsLoaded(true);
          } else {
            setSelectedProducts([]);
            setAssignmentsLoaded(true);
          }
        })
        .catch((error) => {
          console.error("Error loading assigned products:", error);
          setAssignmentsLoaded(true);
        });
    }
  }, [assignDialogOpen, assignmentsLoaded, userId]);

  // Reset flags when dialog closes
  useEffect(() => {
    if (!assignDialogOpen) {
      setProductsLoaded(false);
      setAssignmentsLoaded(false);
    }
  }, [assignDialogOpen]);

  const handleToggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAssignProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/assign-products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productIds: selectedProducts }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to assign products");
        return;
      }

      toast.success("Products assigned successfully");
      setAssignDialogOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to assign products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }
    
    setLoading(true);
    try {
      await deleteUser(userId);
      toast.success("User deleted successfully!");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user");
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
            <Link href={`/admin/users/${userId}`}>View Details</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/users/${userId}/edit`}>Edit</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setAssignDialogOpen(true)}>
            Assign Products
          </DropdownMenuItem>
          {!isCurrentUser && (
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              Delete
            </DropdownMenuItem>
          )}
          {isCurrentUser && (
            <DropdownMenuItem disabled className="text-gray-400">
              Cannot delete your own account
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Products to User</DialogTitle>
            <DialogDescription>
              Select which products &quot;{userName}&quot; can see and order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {!productsLoaded ? (
                <p className="text-gray-500">Loading products...</p>
              ) : products.length === 0 ? (
                <p className="text-gray-500">No products available.</p>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={product.id}
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => handleToggleProduct(product.id)}
                      disabled={loading}
                    />
                    <Label
                      htmlFor={product.id}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {product.name} - {product.capacity}
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
              <Button onClick={handleAssignProducts} disabled={loading}>
                {loading ? "Saving..." : "Save Assignments"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

