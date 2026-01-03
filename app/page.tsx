import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getProducts } from "@/app/actions/products";
import { Phone, Mail } from "lucide-react";
import { HeroCarousel } from "@/components/hero-carousel";
import { ProductImageCarousel } from "@/components/product-image-carousel";

export default async function Home() {
  const products = await getProducts();
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <HeroCarousel />


      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-gray-900 dark:text-white">Our Products</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Explore our range of solar solutions designed for homes, businesses, and industries.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {featuredProducts.map((product) => (
  <div
    key={product.id}
    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 transition-all hover:shadow-md"
  >
    {/* Image */}
    <div className="relative w-full h-56 bg-gray-100 dark:bg-gray-800 rounded-t-xl overflow-hidden">
      <ProductImageCarousel
        images={product.images || []}
        alt={product.name}
      />
    </div>

    {/* Content */}
    <div className="p-5">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {product.name}
      </h3>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {product.capacity}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-lg font-medium text-gray-900 dark:text-gray-200">
          ₹{(product.price / 100).toFixed(2)}
        </span>

        <Link href={`/products/${product.id}`}>
          <Button
            variant="ghost"
            className="text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
          >
            View →
          </Button>
        </Link>
      </div>
    </div>
  </div>
))}

        </div>
        {featuredProducts.length === 0 && (
          <p className="text-center text-gray-500 py-12">No products available yet.</p>
        )}
        {featuredProducts.length > 0 && (
          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
                View All Products
              </Button>
            </Link>
          </div>
        )}
      </section>

            {/* Why Choose Us Section */}
            <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-900 dark:text-white">
            Why Choose Divy Power?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">25+ Years Experience</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Decades of expertise in the energy sector, trusted by thousands of customers across India.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">MNRE & UPNEDA Approved</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Certified engineers and government-approved materials ensure quality and reliability.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Post-Installation Support</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time monitoring and dedicated support team for long-term peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Call to Action Section
      <section className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Go Solar?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get a free consultation and discover how solar can save you money while protecting the environment.
          </p>
          <a href="tel:+919310259325">
            <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
              <Phone className="mr-2 h-5 w-5" />
              Call +91 9310259325
            </Button>
          </a>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">DIVY Power</h3>
              <p className="mb-4 text-sm">
                53, Ramte Ram Rd, Ekta Vihar, Arjun Nagar, Nai Basti Dundaher<br />
                Ghaziabad, Uttar Pradesh 201001
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href="tel:+919310259325" className="hover:text-white">+91 9310259325</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:admin@divypower.com" className="hover:text-white">admin@divypower.com</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:info@divypower.com" className="hover:text-white">info@divypower.com</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:sales@divypower.com" className="hover:text-white">sales@divypower.com</a>
                </div>
              </div>
            </div>

            {/* Useful Links */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Useful Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="hover:text-white">Home</Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-white">Products</Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white">About</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">Services</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">Contact</a>
                </li>
              </ul>
            </div>

            {/* Our Solutions */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Our Solutions</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">Solar Rooftop</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">Battery Storage</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">Solar Street Lights</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">Hybrid Solar Systems</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">Solar Water Pump</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">EV Charging Stations</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm">
              <p>© {new Date().getFullYear()} DIVY POWER. All rights reserved.</p>
              <div className="flex gap-4 mt-4 md:mt-0">
                <a href="#" className="hover:text-white">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
