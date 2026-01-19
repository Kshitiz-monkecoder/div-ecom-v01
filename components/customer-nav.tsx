"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, LogOut, LayoutDashboard, HelpCircle, User, Package, Gift } from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/orders", label: "My Orders", icon: Package },
  { href: "/tickets", label: "Support", icon: HelpCircle },
    { href: "/referrals", label: "Referrals & Tokens", icon: Gift },
  { href: "/account", label: "Account", icon: User },
];

export function CustomerHeader() {
  const router = useRouter();

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
    <header className="w-full border-b bg-gray-50 dark:bg-gray-900 px-4 md:px-6 py-4 flex items-center justify-between">
<Link href="/" className="flex items-center">
  <Image
    src="/divy-power-logo.png"
    alt="DIVY Power"
    width={160}
    height={60}
    className="h-12 w-auto"
    priority
  />
</Link>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </header>
  );
}

export function CustomerNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const savedCollapsed = localStorage.getItem("sidebar-collapsed");
      if (savedCollapsed !== null) {
        return savedCollapsed === "true";
      }
      return window.innerWidth < 768;
    }
    return false;
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMounted] = useState(true);

  useEffect(() => {
    // Check if user is admin
    fetch("/api/check-admin")
      .then((res) => res.json())
      .then((data) => {
        setIsAdmin(data.isAdmin || false);
      })
      .catch(() => {
        setIsAdmin(false);
      });
  }, []);

  // Handle sidebar collapse on mobile
  useEffect(() => {
    if (!isMounted) return;

    const handleResize = () => {
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setIsCollapsed(true);
        localStorage.setItem("sidebar-collapsed", "true");
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMounted]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className={cn(
        "hidden md:flex md:flex-col border-r bg-gray-50 dark:bg-gray-900 transition-all duration-300 ease-in-out min-h-screen",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex flex-col h-full p-4">
          <div className={cn("flex items-center mb-4", isCollapsed ? "justify-center" : "justify-end")}>
            {!isCollapsed && isMounted ? (
              <button
                onClick={() => {
                  setIsCollapsed(true);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("sidebar-collapsed", "true");
                  }
                }}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
                aria-label="Collapse sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            ) : isCollapsed && isMounted ? (
              <button
                onClick={() => {
                  setIsCollapsed(false);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("sidebar-collapsed", "false");
                  }
                }}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
                aria-label="Expand sidebar"
              >
                <Menu className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="space-y-2 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={pathname === item.href ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      pathname === item.href && "bg-primary",
                      isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                    {(!isCollapsed || !isMounted) && item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="space-y-2 mt-auto pt-4 border-t">
            {isAdmin && (
              <Link href="/admin">
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? "Admin Panel" : undefined}
                >
                  <LayoutDashboard className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {(!isCollapsed || !isMounted) && "Admin Panel"}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Top Navigation */}
      <nav className="md:hidden border-b bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between p-4">
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
              <h2 className="text-lg font-semibold mb-4 px-2">Dashboard</h2>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={closeMobileMenu}>
                    <Button
                      variant={pathname === item.href ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        pathname === item.href && "bg-primary"
                      )}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              {isAdmin && (
                <Link href="/admin" onClick={closeMobileMenu}>
                  <Button variant="outline" className="w-full justify-start">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
