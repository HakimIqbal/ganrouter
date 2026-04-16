import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getSettings } from "@/lib/localDb";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ganrouter-default-secret-change-me"
);

// Public routes — no auth needed
const PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/health",
  "/api/locale",
  "/api/version",
  "/api/settings/require-login",
  "/login",
  "/landing",
];

// Routes that authenticate via Bearer API key (not JWT)
const API_KEY_AUTH_PATHS = [
  "/api/v1/",
];

// Always require JWT token regardless of requireLogin setting
const ALWAYS_PROTECTED = [
  "/api/shutdown",
  "/api/settings/database",
];

function isLocalRequest(request) {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

async function hasValidToken(request) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

// Read settings directly from DB to avoid self-fetch deadlock in proxy
async function loadSettings() {
  try {
    return await getSettings();
  } catch {
    return null;
  }
}

async function isAuthenticated(request) {
  return await hasValidToken(request);
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const isLocal = isLocalRequest(request);

  // Public paths — no auth needed
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // API key auth paths (/api/v1/*) — authenticated via Bearer token in route handlers
  if (API_KEY_AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Always protected — require JWT or localhost, never bypass
  if (ALWAYS_PROTECTED.some((p) => pathname.startsWith(p))) {
    if (isLocal || await hasValidToken(request))
      return NextResponse.next();
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Static assets and non-API paths (CSS, JS, images, _next)
  if (!pathname.startsWith("/api/") && !pathname.startsWith("/dashboard")) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // ALL remaining /api/* and /dashboard/* routes — require auth
  let tunnelDashboardAccess = true;
  try {
    const settings = await loadSettings();
    if (settings) {
      tunnelDashboardAccess = settings.tunnelDashboardAccess === true;
      if (!tunnelDashboardAccess) {
        const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();
        const tunnelHost = settings.tunnelUrl ? new URL(settings.tunnelUrl).hostname.toLowerCase() : "";
        const tailscaleHost = settings.tailscaleUrl ? new URL(settings.tailscaleUrl).hostname.toLowerCase() : "";
        if ((tunnelHost && host === tunnelHost) || (tailscaleHost && host === tailscaleHost)) {
          if (pathname.startsWith("/api/")) {
            return NextResponse.json({ error: "Tunnel access disabled" }, { status: 403 });
          }
          return NextResponse.redirect(new URL("/login", request.url));
        }
      }
    }
  } catch {
    // On error, require auth (fail-closed)
  }

  // Allow if localhost or has valid JWT
  if (isLocal || await hasValidToken(request)) {
    return NextResponse.next();
  }

  // Not authenticated — reject
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/api/:path*",
  ],
};
