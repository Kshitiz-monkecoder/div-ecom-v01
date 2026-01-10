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

interface Product {
  id: string;
  name: string;
  capacity: string;
}

interface AssignProductsFormProps {
  userId: string;
  assignedProductIds: string[];
  allProducts: Product[];
}

export function AssignProductsForm({
  userId,
  assignedProductIds,
  allProducts,
}: AssignProductsFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    assignedProductIds
  );
  const router = useRouter();

  useEffect(() => {
    setSelectedProducts(assignedProductIds);
  }, [assignedProductIds]);

  const handleToggle = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to assign products");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Assign Products</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Products to User</DialogTitle>
          <DialogDescription>
            Select which products this user can see and order.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {allProducts.length === 0 ? (
              <p className="text-gray-500">No products available.</p>
            ) : (
              allProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={product.id}
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => handleToggle(product.id)}
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

