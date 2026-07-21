import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ISSUER = "duta-genre-klaten";
const AUDIENCE = "duta-genre-admin";

function getJwtSecret(): Uint8Array {
  const secretString = process.env.JWT_SECRET;
  if (!secretString && (process.env.NODE_ENV === "production" || process.env.APP_ENV === "production" || process.env.APP_ENV === "staging")) {
    throw new Error("JWT_SECRET is required in production/staging environments.");
  }
  return new TextEncoder().encode(secretString || "klaten-duta-genre-super-secret-key-2026");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const JWT_SECRET = getJwtSecret();
      await jwtVerify(token, JWT_SECRET, {
        issuer: ISSUER,
        audience: AUDIENCE,
      });
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware auth verification failed:", error);
      const loginUrl = new URL("/admin/login", request.url);
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
