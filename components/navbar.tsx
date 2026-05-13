"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/check-admin")
      .then((res) => res.json())
      .then((data) => {
        setIsSignedIn(!!data.user);
        setIsAdmin(data.isAdmin || false);
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
      setIsAdmin(false);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/90 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 rounded-2xl customer-focus-ring">
          <Image
            src="/divy-power-logo.png"
            alt="Divy Power"
            width={132}
            height={46}
            className="h-10 w-auto"
            priority
          />
          <span className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 sm:inline">Solar customer portal</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {isSignedIn ? (
            <>
              <Button asChild variant="ghost" className="rounded-full text-muted-foreground hover:bg-slate-100 hover:text-orange-900">
                <Link href="/orders">My orders</Link>
              </Button>
              <Button asChild variant="ghost" className="rounded-full text-muted-foreground hover:bg-slate-100 hover:text-orange-900">
                <Link href="/tickets">Support</Link>
              </Button>
              <Button asChild variant="ghost" className="rounded-full text-muted-foreground hover:bg-slate-100 hover:text-orange-900">
                <Link href="/account">Account</Link>
              </Button>
              {isAdmin && (
                <Button asChild variant="outline" className="rounded-full bg-white">
                  <Link href="/admin">
                    <LayoutDashboard className="size-4" />
                    Admin
                  </Link>
                </Button>
              )}
              <Button variant="ghost" onClick={handleSignOut} className="rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-700">
                <LogOut className="size-4" />
                Sign out
              </Button>
            </>
          ) : (
            <Button asChild className="rounded-full bg-primary px-5 text-white hover:bg-slate-800">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </nav>

        <button
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className="rounded-full p-2 text-muted-foreground hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white/95 px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {isSignedIn ? (
              <>
                <MobileLink href="/orders" onClick={() => setIsMobileMenuOpen(false)}>My orders</MobileLink>
                <MobileLink href="/tickets" onClick={() => setIsMobileMenuOpen(false)}>Support</MobileLink>
                <MobileLink href="/account" onClick={() => setIsMobileMenuOpen(false)}>Account</MobileLink>
                {isAdmin && <MobileLink href="/admin" onClick={() => setIsMobileMenuOpen(false)}>Admin</MobileLink>}
                <button
                  className="rounded-2xl px-4 py-3 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <MobileLink href="/login" onClick={() => setIsMobileMenuOpen(false)}>Sign in</MobileLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MobileLink({ href, onClick, children }: { href: string; onClick: () => void; children: ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
      {children}
    </Link>
  );
}
