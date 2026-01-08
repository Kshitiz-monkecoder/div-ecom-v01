"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    fetch("/api/check-admin")
      .then((res) => res.json())
      .then((data) => {
        setIsSignedIn(!!data.user);
        setIsAdmin(data.isAdmin || false);
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        setIsSignedIn(false);
        setIsAdmin(false);
      });
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      setIsSignedIn(false);
      setUser(null);
      setIsAdmin(false);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="border-b bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Products link removed - users see assigned products on orders page */}
            {/* <Link href="/products">
              <Button variant="ghost">Products</Button>
            </Link> */}

            {isSignedIn ? (
              <>
                <Link href="/orders">
                  <Button variant="ghost">My Orders</Button>
                </Link>
                <Link href="/tickets">
                  <Button variant="ghost">Support</Button>
                </Link>
                <Link href="/account">
                  <Button variant="ghost">Account</Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost">Admin</Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button>Sign In</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col gap-2">
              {/* Products link removed - users see assigned products on orders page */}
              {/* <Link href="/products" onClick={closeMobileMenu}>
                <Button variant="ghost" className="w-full justify-start">
                  Products
                </Button>
              </Link> */}

              {isSignedIn ? (
                <>
                  <Link href="/orders" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start">
                      My Orders
                    </Button>
                  </Link>
                  <Link href="/tickets" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start">
                      Support
                    </Button>
                  </Link>
                  <Link href="/account" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start">
                      Account
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={closeMobileMenu}>
                      <Button variant="ghost" className="w-full justify-start">
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      closeMobileMenu();
                      handleSignOut();
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={closeMobileMenu}>
                    <Button className="w-full justify-start">Sign In</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

