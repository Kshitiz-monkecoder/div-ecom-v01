"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function Navbar() {
  const { isSignedIn, user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      // Check admin status
      fetch("/api/check-admin")
        .then((res) => res.json())
        .then((data) => setIsAdmin(data.isAdmin))
        .catch(() => setIsAdmin(false));
    }
  }, [isSignedIn]);

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

          <div className="flex items-center gap-4">
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
        </div>
      </div>
    </nav>
  );
}

