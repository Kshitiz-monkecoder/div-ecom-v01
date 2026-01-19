import { EditProductForm } from "@/components/edit-product-form";
import { getProduct } from "@/app/actions/products";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/products">
          <Button variant="ghost">← Back to Products</Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>
      <EditProductForm product={product} />
    </div>
  );
}

