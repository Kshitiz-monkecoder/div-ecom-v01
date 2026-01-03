"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const { isSignedIn, user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      // Check admin status
      fetch("/api/check-admin")
        .then((res) => res.json())
        .then((data) => setIsAdmin(data.isAdmin))
        .catch(() => setIsAdmin(false));
    }
  }, [isSignedIn]);

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
            <Link href="/products">
              <Button variant="ghost">Products</Button>
            </Link>

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
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button>Sign Up</Button>
                </SignUpButton>
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
              <Link href="/products" onClick={closeMobileMenu}>
                <Button variant="ghost" className="w-full justify-start">
                  Products
                </Button>
              </Link>

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
                  <div className="flex items-center justify-start px-2 py-1">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <Button variant="ghost" className="w-full justify-start">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="w-full justify-start">Sign Up</Button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

