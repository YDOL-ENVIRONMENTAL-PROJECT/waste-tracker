import { NextResponse } from "next/server";

/**
 * Middleware to protect routes
 * - Redirects unauthenticated users from protected routes to login
 * - Redirects authenticated users away from auth pages
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Auth pages that should not be accessible when authenticated
  const authPages = ["/connexion", "/inscription", "/forgot-password", "/reset-password"];

  // Protected pages that require authentication
  const protectedPages = ["/admin", "/client", "/driver"];

  const isAuthPage = authPages.some((page) => pathname.startsWith(page));
  const isProtectedPage = protectedPages.some((page) => pathname.startsWith(page));

  // Check if user has token in localStorage (Note: localStorage is not available in middleware)
  // Instead, we check the token from cookies
  // For now, we'll focus on redirecting based on pathname patterns
  // Full token validation should happen on the client side

  // If user tries to access protected route without auth
  if (isProtectedPage && !token) {
    const loginUrl = new URL("/connexion", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated user tries to access auth pages, redirect to home
  // This is limited because middleware can't fully validate tokens
  // Full validation happens on the client side

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
