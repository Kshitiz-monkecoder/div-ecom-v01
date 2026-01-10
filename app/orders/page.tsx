import { getUserOrders } from "@/app/actions/orders";
import { getProducts } from "@/app/actions/products";
import CustomerLayout from "@/components/customer-layout";
import { ProductCard } from "@/components/product-card";
import { OrderCard } from "@/components/order-card";
import { ParsedProduct } from "@/types";

export default async function OrdersPage() {
  const [orders, assignedProducts] = await Promise.all([
    getUserOrders(),
    getProducts(),
  ]);

  return (
    <CustomerLayout>
      <div>
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {/* Orders Section */}
        {orders.length > 0 ? (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Order History</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-12">
            <p className="text-center text-gray-500 py-8">
              You haven&apos;t placed any orders yet.
            </p>
          </div>
        )}

        {/* Assigned Products Section */}
        {assignedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Available Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignedProducts.map((product: ParsedProduct) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

