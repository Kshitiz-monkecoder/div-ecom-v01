// Commented out products page - users will see assigned products on orders page
import { notFound } from "next/navigation";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  notFound();
}

// OLD PRODUCTS PAGE CODE - COMMENTED OUT
/*
import { Navbar } from "@/components/navbar";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/app/actions/products";
import { PRODUCT_CATEGORIES } from "@/types";
import Link from "next/link";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const products = await getProducts(category);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Our Products</h1>

        {/* Category Filter */
/*        <div className="mb-8 flex gap-4">
          <Link
            href="/products"
            className={`px-4 py-2 rounded ${
              !category
                ? "bg-primary text-primary-foreground"
                : "bg-gray-200 dark:bg-gray-800"
            }`}
          >
            All
          </Link>
          {PRODUCT_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/products?category=${cat}`}
              className={`px-4 py-2 rounded ${
                category === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-200 dark:bg-gray-800"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Products Grid */
/*        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <p className="text-center text-gray-500 py-12">
            No products found in this category.
          </p>
        )}
      </div>
    </div>
  );
}
*/

