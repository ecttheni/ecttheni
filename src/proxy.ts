import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const isAdminRoute = pathname.startsWith("/admin");

    // Non-admin trying to access admin area → redirect to home
    if (isAdminRoute && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only allow authenticated users through; others go to /login
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  // Protect admin, dashboard, and profile routes
  matcher: ["/admin/:path*", "/dashboard/:path*", "/profile/:path*"],
};
