import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ["/login", "/signup", "/invite", "/join", "/api/cron"];
const API_AUTH_PREFIX = "/api/auth";

function getToken(req: NextRequest): string | null {
    const cookie = req.cookies.get("token")?.value;
    if (cookie) return cookie;
    const header = req.headers.get("authorization");
    if (header?.startsWith("Bearer ")) return header.slice(7);
    return null;
}

export async function middleware(req: NextRequest) {
    const { pathname, hostname } = req.nextUrl;
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "thinkauric.com";

    // ── Subdomain routing ────────────────────────────────────────────────────
    // If request is on a subdomain (e.g. ironfit.thinkauric.com),
    // rewrite /join/* to the tenant's signup form
    const isSubdomain =
        hostname !== baseDomain &&
        hostname !== `www.${baseDomain}` &&
        hostname.endsWith(`.${baseDomain}`);

    if (isSubdomain) {
        const slug = hostname.replace(`.${baseDomain}`, "");
        // Rewrite root to the join page for this tenant slug
        if (pathname === "/" || pathname === "") {
            return NextResponse.rewrite(new URL(`/join/${slug}`, req.url));
        }
        // Allow all other paths through (dashboard, api, etc.)
        return NextResponse.next();
    }

    // Allow public auth API routes
    if (pathname.startsWith(API_AUTH_PREFIX)) return NextResponse.next();
    if (pathname.startsWith("/api/public")) return NextResponse.next();

    // Allow public pages
    if (pathname === "/") return NextResponse.next();
    if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) return NextResponse.next();

    const token = getToken(req);

    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        const { payload } = await jwtVerify(token, secret);

        const requestHeaders = new Headers(req.headers);
        requestHeaders.set("x-user-id", payload.userId as string);
        requestHeaders.set("x-tenant-id", payload.tenantId as string);
        requestHeaders.set("x-user-role", payload.role as string);

        return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
        const res = NextResponse.redirect(new URL("/login", req.url));
        res.cookies.delete("token");
        return res;
    }
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
