"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/tickets", label: "Tickets" },
  { href: "/admin/users", label: "Users" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex md:flex-col w-64 border-r bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="flex flex-col h-full max-h-screen p-4">
          <div className="space-y-2 flex-1">
            <Link href="/" className="block mb-4">
              <Image
                src="/divy-power-logo.png"
                alt="DIVY Power"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>
            <h2 className="text-lg font-semibold mb-4">Admin Panel</h2>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    pathname === item.href && "bg-primary"
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
          <div className="mt-auto pt-4 border-t">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Top Navigation */}
      <nav className="md:hidden border-b bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/divy-power-logo.png"
              alt="DIVY Power"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="border-t bg-white dark:bg-gray-900">
            <div className="p-4 space-y-2">
              <h2 className="text-lg font-semibold mb-4 px-2">Admin Panel</h2>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={closeMobileMenu}>
                  <Button
                    variant={pathname === item.href ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      pathname === item.href && "bg-primary"
                    )}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  onClick={() => {
                    closeMobileMenu();
                    handleSignOut();
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

