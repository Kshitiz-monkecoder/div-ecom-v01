import { CreateProductForm } from "@/components/create-product-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/products">
          <Button variant="ghost">← Back to Products</Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Create New Product</h1>
      <CreateProductForm />
    </div>
  );
}

