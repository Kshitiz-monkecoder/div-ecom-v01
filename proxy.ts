import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "auth_session";

function getSession(
  request: NextRequest
): { userId: string; role?: "USER" | "ADMIN"; token: string } | null {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    
    if (!sessionCookie?.value) {
      return null;
    }

    const session = JSON.parse(sessionCookie.value) as {
      userId: string;
      role?: "USER" | "ADMIN";
      token: string;
    };
    return session;
  } catch {
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page, API routes, and admin routes without redirecting
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if user is authenticated and is an admin
  try {
    const session = getSession(request);

    // If user is admin and trying to access non-admin routes, redirect to /admin
    if (session?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  } catch (error) {
    // If there's an error, continue with the request
    console.error("Middleware error:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

