import { NextRequest } from "next/server";
import { verifyToken, JWTPayload } from "@/lib/auth";
import { errorResponse } from "@/lib/api";
import { hasRole } from "@/lib/rbac";
import { Role } from "@prisma/client";

export function getAuthPayload(req: NextRequest): JWTPayload | null {
    const token =
        req.cookies.get("token")?.value ||
        req.headers.get("authorization")?.split(" ")[1];
    if (!token) return null;
    return verifyToken(token);
}

export function requireAuth(req: NextRequest) {
    const payload = getAuthPayload(req);
    if (!payload) return { error: errorResponse("Unauthorized.", 401), payload: null };
    return { error: null, payload };
}

export function requireRole(req: NextRequest, role: Role) {
    const { error, payload } = requireAuth(req);
    if (error || !payload) return { error: error ?? errorResponse("Unauthorized.", 401), payload: null };
    if (!hasRole(payload.role as Role, role)) {
        return { error: errorResponse("Forbidden.", 403), payload: null };
    }
    return { error: null, payload };
}
