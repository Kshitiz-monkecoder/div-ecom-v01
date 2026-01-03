import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProduct } from "@/app/actions/products";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { OrderForm } from "@/components/order-form";
import { getCurrentUser } from "@/lib/auth";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  const user = await getCurrentUser();

  if (!product) {
    notFound();
  }

  const priceInRupees = (product.price / 100).toFixed(2);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            {product.images.length > 0 ? (
              <div className="relative w-full h-96 rounded-lg overflow-hidden">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No Image Available</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              <div className="flex gap-2 mb-4">
                <Badge>{product.category}</Badge>
                <Badge variant="outline">{product.capacity}</Badge>
              </div>
              <p className="text-3xl font-bold mb-4">₹{priceInRupees}</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-2">Description</h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {user && (
              <OrderForm productId={product.id} />
            )}

            {!user && (
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <p className="mb-4">Please sign in to place an order.</p>
                <Link href="/sign-in">
                  <Button>Sign In</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

