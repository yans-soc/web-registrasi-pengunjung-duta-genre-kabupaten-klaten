import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// IMPORTANT: Must match the secret used in src/lib/jwt.ts
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "klaten-duta-genre-super-secret-key-2026"
);

const ISSUER = "duta-genre-klaten";
const AUDIENCE = "duta-genre-admin";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except login and api routes)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify token in Middleware using jose (Edge-compatible)
      await jwtVerify(token, JWT_SECRET, {
        issuer: ISSUER,
        audience: AUDIENCE,
      });
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware auth verification failed:", error);
      const loginUrl = new URL("/admin/login", request.url);
      // Clear invalid token cookie
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
