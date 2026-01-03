"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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

interface ProductActionsProps {
  product: ParsedProduct;
}

export function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      await toggleProductStatus(product.id);
      toast.success(`Product ${product.isActive ? "deactivated" : "activated"} successfully!`);
      router.refresh();
    } catch (error) {
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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={loading}>
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleToggleStatus}>
          {product.isActive ? "Deactivate" : "Activate"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

