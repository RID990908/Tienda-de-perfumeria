import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
const DEV_ORIGIN_PATTERN = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

function getAllowedOrigins() {
  const fromEnv = (process.env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const defaults = [
    "http://localhost:3000",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3002",
  ];

  return new Set([...defaults, ...fromEnv]);
}

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (process.env.NODE_ENV !== "production" && DEV_ORIGIN_PATTERN.test(origin)) {
    return true;
  }

  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.has(origin);
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get("origin");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    if (isAllowedOrigin(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    return response;
  }

  const token = req.cookies.get("token")?.value;
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  // Logic to determine initial response
  let response = NextResponse.next();

  if (isAdminApiRoute && pathname !== "/api/admin/auth/login") {
    if (!token) {
      response = NextResponse.json({ error: "No autorizado" }, { status: 401 });
    } else if (JWT_SECRET) {
      try {
        const secretKey = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secretKey);

        if (payload.role !== "admin") {
          response = NextResponse.json({ error: "Permisos insuficientes" }, { status: 403 });
        }
      } catch {
        response = NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });
      }
    }
  }

  // Add CORS headers to all API responses (including errors returned above)
  if (isAllowedOrigin(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
