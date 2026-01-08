import { getUserOrders } from "@/app/actions/orders";
import { getProducts } from "@/app/actions/products";
import { Navbar } from "@/components/navbar";
import { ProductCard } from "@/components/product-card";
import { requireAuth } from "@/lib/middleware";
import { ParsedProduct } from "@/types";

export default async function OrdersPage() {
  await requireAuth();
  const [___,assignedProducts] = await Promise.all([
    getUserOrders(),
    getProducts(),
  ]);


  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {/* Assigned Products Section */}
        {assignedProducts.length > 0 && (
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignedProducts.map((product: ParsedProduct) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

